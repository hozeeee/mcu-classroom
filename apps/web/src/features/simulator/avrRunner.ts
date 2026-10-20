import type { AvrPinRef, AvrPortName } from './unoPins'
import {
  adcConfig,
  AVRADC,
  avrInstruction,
  AVRIOPort,
  AVRTimer,
  AVRUSART,
  CPU,
  PinState,
  portBConfig,
  portCConfig,
  portDConfig,
  timer0Config,
  timer1Config,
  timer2Config,
  usart0Config,
} from 'avr8js'
import { loadIntelHex } from './intelHex'
import { PinMonitor } from './pinMonitor'
import { AVR_CLOCK_HZ, UNO_PINS } from './unoPins'

const FLASH_BYTES = 0x8000
/** 每执行这么多周期检查一次串口接收队列 */
const RX_CHECK_CYCLES = 2000

/**
 * ATmega328P 运行器：CPU + 定时器 + GPIO + USART + ADC
 * 只负责"芯片"本身，外围电路的行为由 CircuitEngine 计算
 */
export class AvrRunner {
  readonly cpu: CPU
  private readonly ports: Record<AvrPortName, AVRIOPort>
  private readonly usart: AVRUSART
  private readonly adc: AVRADC
  private readonly monitors = new Map<string, { ref: AvrPinRef, monitor: PinMonitor }>()
  private readonly rxQueue: number[] = []
  private txBuffer: number[] = []

  constructor(hex: string) {
    const program = new Uint16Array(FLASH_BYTES / 2)
    loadIntelHex(hex, new Uint8Array(program.buffer))
    this.cpu = new CPU(program)
    // 定时器实例需要保持创建，它们会把自己挂到 CPU 上
    void [timer0Config, timer1Config, timer2Config].map(config => new AVRTimer(this.cpu, config))
    this.ports = {
      B: new AVRIOPort(this.cpu, portBConfig),
      C: new AVRIOPort(this.cpu, portCConfig),
      D: new AVRIOPort(this.cpu, portDConfig),
    }
    this.usart = new AVRUSART(this.cpu, usart0Config, AVR_CLOCK_HZ)
    this.usart.onByteTransmit = byte => this.txBuffer.push(byte)
    this.adc = new AVRADC(this.cpu, adcConfig)

    for (const name of Object.keys(this.ports) as AvrPortName[]) {
      this.ports[name].addListener(() => this.updateMonitors(name))
    }
  }

  get cycles(): number {
    return this.cpu.cycles
  }

  get seconds(): number {
    return this.cpu.cycles / AVR_CLOCK_HZ
  }

  pinState(pinId: string): PinState | undefined {
    const ref = UNO_PINS[pinId]
    return ref ? this.ports[ref.port].pinState(ref.bit) : undefined
  }

  isOutput(pinId: string): boolean {
    const state = this.pinState(pinId)
    return state === PinState.High || state === PinState.Low
  }

  isPullUp(pinId: string): boolean {
    return this.pinState(pinId) === PinState.InputPullUp
  }

  setDigitalInput(pinId: string, high: boolean): void {
    const ref = UNO_PINS[pinId]
    if (ref)
      this.ports[ref.port].setPin(ref.bit, high)
  }

  setAnalogInput(pinId: string, volts: number): void {
    const channel = UNO_PINS[pinId]?.adc
    if (channel !== undefined)
      this.adc.channelValues[channel] = volts
  }

  /** 监视引脚以统计 PWM 占空比 / 频率 / 脉宽 */
  watch(pinId: string): void {
    const ref = UNO_PINS[pinId]
    if (!ref || this.monitors.has(pinId))
      return
    const monitor = new PinMonitor(AVR_CLOCK_HZ)
    monitor.update(this.ports[ref.port].pinState(ref.bit) === PinState.High, this.cpu.cycles)
    this.monitors.set(pinId, { ref, monitor })
  }

  beginWindow(): void {
    for (const { monitor } of this.monitors.values())
      monitor.beginWindow(this.cpu.cycles)
  }

  pinStats(pinId: string) {
    return this.monitors.get(pinId)?.monitor.stats(this.cpu.cycles)
  }

  sendSerial(bytes: Iterable<number>): void {
    this.rxQueue.push(...bytes)
  }

  takeSerialOutput(): Uint8Array {
    const bytes = Uint8Array.from(this.txBuffer)
    this.txBuffer = []
    return bytes
  }

  /** 执行指定数量的 CPU 周期 */
  run(cycles: number): void {
    const { cpu } = this
    const end = cpu.cycles + cycles
    while (cpu.cycles < end) {
      const chunkEnd = Math.min(end, cpu.cycles + RX_CHECK_CYCLES)
      while (cpu.cycles < chunkEnd) {
        avrInstruction(cpu)
        cpu.tick()
      }
      this.feedSerial()
    }
  }

  private feedSerial(): void {
    if (this.rxQueue.length && !this.usart.rxBusy && this.usart.writeByte(this.rxQueue[0]!))
      this.rxQueue.shift()
  }

  private updateMonitors(port: AvrPortName): void {
    for (const { ref, monitor } of this.monitors.values()) {
      if (ref.port === port)
        monitor.update(this.ports[port].pinState(ref.bit) === PinState.High, this.cpu.cycles)
    }
  }
}
