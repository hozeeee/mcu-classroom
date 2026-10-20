import type { SerialClientMessage, SerialServerMessage } from '@mcu/shared'
import { WS_PATHS } from '@mcu/shared'
import { useCallback, useEffect, useRef, useState } from 'react'
import { wsUrl } from '../../api/client'

export type SerialStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error'

interface SerialConnectionOptions {
  onData: (bytes: Uint8Array) => void
  onInfo?: (message: string) => void
}

function decodeBase64(data: string): Uint8Array {
  return Uint8Array.from(atob(data), char => char.charCodeAt(0))
}

/**
 * 通过后端 WS 桥接真实串口：
 * const serial = useSerialConnection({ onData })
 * serial.connect('COM3', 9600) / serial.send('hello\n') / serial.disconnect()
 */
export function useSerialConnection({ onData, onInfo }: SerialConnectionOptions) {
  const [status, setStatus] = useState<SerialStatus>('idle')
  const [error, setError] = useState<string>()
  const socketRef = useRef<WebSocket | null>(null)
  const handlersRef = useRef({ onData, onInfo })

  useEffect(() => {
    handlersRef.current = { onData, onInfo }
  })

  const disconnect = useCallback(() => {
    const socket = socketRef.current
    socketRef.current = null
    socket?.close()
    setStatus('idle')
  }, [])

  const connect = useCallback((port: string, baud: number) => {
    socketRef.current?.close()
    setStatus('connecting')
    setError(undefined)
    const socket = new WebSocket(wsUrl(WS_PATHS.serial, { port, baud }))
    socketRef.current = socket
    const isCurrent = () => socketRef.current === socket

    socket.onmessage = (event: MessageEvent<string>) => {
      if (!isCurrent())
        return
      const message = JSON.parse(event.data) as SerialServerMessage
      switch (message.type) {
        case 'data':
          handlersRef.current.onData(decodeBase64(message.data))
          break
        case 'status':
          setStatus(message.open ? 'open' : 'closed')
          handlersRef.current.onInfo?.(message.message)
          break
        case 'error':
          setStatus('error')
          setError(message.message)
          handlersRef.current.onInfo?.(`错误：${message.message}`)
          break
      }
    }
    socket.onerror = () => {
      if (!isCurrent())
        return
      setStatus('error')
      setError('无法连接后端串口服务，请确认后端已启动')
    }
    socket.onclose = () => {
      if (!isCurrent())
        return
      socketRef.current = null
      setStatus(current => (current === 'error' ? current : 'closed'))
    }
  }, [])

  const send = useCallback((text: string): boolean => {
    const socket = socketRef.current
    if (socket?.readyState !== WebSocket.OPEN)
      return false
    const message: SerialClientMessage = { type: 'send', data: text }
    socket.send(JSON.stringify(message))
    return true
  }, [])

  useEffect(() => () => {
    const socket = socketRef.current
    socketRef.current = null
    socket?.close()
  }, [])

  return { status, error, connect, disconnect, send }
}
