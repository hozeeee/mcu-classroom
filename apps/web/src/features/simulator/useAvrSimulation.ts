import type { CircuitDoc } from '@mcu/shared'
import type { PartSimState } from '../circuit/parts/types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AvrRunner } from './avrRunner'
import { BuzzerAudio } from './buzzerAudio'
import { CircuitEngine } from './circuitEngine'
import { AVR_CLOCK_HZ } from './unoPins'

/** 单帧最多推进的真实时间，避免标签页切回时一次跑太多 */
const MAX_FRAME_MS = 50

interface SimulationOptions {
  circuit: CircuitDoc
  onSerialData?: (bytes: Uint8Array) => void
  onError?: (error: Error) => void
}

interface SimulationSession {
  runner: AvrRunner
  engine: CircuitEngine
  frame: number
}

/**
 * Arduino Uno 浏览器仿真：
 * const sim = useAvrSimulation({ circuit, onSerialData })
 * sim.start(hex) / sim.stop() / sim.pressButton(id, true)
 */
export function useAvrSimulation({ circuit, onSerialData, onError }: SimulationOptions) {
  const [running, setRunning] = useState(false)
  const [partStates, setPartStates] = useState<Record<string, PartSimState>>({})
  const [simSeconds, setSimSeconds] = useState(0)
  const [muted, setMuted] = useState(false)
  const sessionRef = useRef<SimulationSession | null>(null)
  const audioRef = useRef<BuzzerAudio | null>(null)
  const latestRef = useRef({ circuit, onSerialData, onError, muted })

  useEffect(() => {
    latestRef.current = { circuit, onSerialData, onError, muted }
  })

  useEffect(() => {
    sessionRef.current?.engine.setCircuit(circuit)
  }, [circuit])

  const stop = useCallback(() => {
    if (sessionRef.current)
      cancelAnimationFrame(sessionRef.current.frame)
    sessionRef.current = null
    audioRef.current?.dispose()
    audioRef.current = null
    setRunning(false)
    setPartStates({})
  }, [])

  const start = useCallback((hex: string) => {
    stop()
    const runner = new AvrRunner(hex)
    const engine = new CircuitEngine(latestRef.current.circuit, runner)
    const current: SimulationSession = { runner, engine, frame: 0 }
    sessionRef.current = current
    audioRef.current = new BuzzerAudio()
    let last = performance.now()

    const tick = (now: number) => {
      if (sessionRef.current !== current)
        return
      const elapsed = Math.min(now - last, MAX_FRAME_MS)
      last = now
      try {
        engine.applyInputs()
        runner.beginWindow()
        runner.run(Math.round((AVR_CLOCK_HZ * elapsed) / 1000))
      }
      catch (error) {
        stop()
        latestRef.current.onError?.(error instanceof Error ? error : new Error(String(error)))
        return
      }
      const states = engine.readStates()
      setPartStates(states)
      setSimSeconds(runner.seconds)
      const frequency = Math.max(0, ...Object.values(states).map(state => state.frequency ?? 0))
      audioRef.current?.setFrequency(latestRef.current.muted ? 0 : frequency)
      const serial = runner.takeSerialOutput()
      if (serial.length)
        latestRef.current.onSerialData?.(serial)
      current.frame = requestAnimationFrame(tick)
    }

    current.frame = requestAnimationFrame(tick)
    setRunning(true)
    setSimSeconds(0)
  }, [stop])

  const pressButton = useCallback((partId: string, pressed: boolean) => {
    const engine = sessionRef.current?.engine
    if (!engine || engine.isPressed(partId) === pressed)
      return
    engine.setPressed(partId, pressed)
    setPartStates(states => ({ ...states, [partId]: { pressed } }))
  }, [])

  const sendSerial = useCallback((text: string) => {
    sessionRef.current?.runner.sendSerial(new TextEncoder().encode(text))
  }, [])

  useEffect(() => stop, [stop])

  return { running, start, stop, partStates, simSeconds, pressButton, sendSerial, muted, setMuted }
}
