import type { CircuitDoc, CircuitPart } from '@mcu/shared'
import type { PartSimState } from '../circuit/parts/types'
import type { AvrRunner } from './avrRunner'
import type { Drive, Net, Netlist } from './netlist'
import { buildNetlist, endpointKey, resolveDrive } from './netlist'
import { UNO_PINS } from './unoPins'

const SERVO_MIN_US = 544
const SERVO_MAX_US = 2400
const LOGIC_HIGH_THRESHOLD = 2.5

/**
 * 外围电路仿真：根据网络表把芯片引脚状态映射到元件（LED 亮度、蜂鸣器频率、舵机角度），
 * 并把按键 / 电位器 / 光敏电阻的状态反馈到芯片输入引脚。
 */
export class CircuitEngine {
  private doc: CircuitDoc
  private netlist!: Netlist
  private readonly pressed = new Set<string>()

  constructor(doc: CircuitDoc, private readonly runner: AvrRunner) {
    this.doc = doc
    this.rebuild()
  }

  setCircuit(doc: CircuitDoc): void {
    this.doc = doc
    this.rebuild()
  }

  setPressed(partId: string, pressed: boolean): void {
    if (pressed)
      this.pressed.add(partId)
    else
      this.pressed.delete(partId)
    this.rebuild()
  }

  isPressed(partId: string): boolean {
    return this.pressed.has(partId)
  }

  /** 每帧运行 CPU 之前调用：把外部电路状态写入芯片输入 */
  applyInputs(): void {
    const board = this.netlist.board
    if (!board)
      return
    for (const pinId of Object.keys(UNO_PINS)) {
      if (this.runner.isOutput(pinId))
        continue
      const volts = this.inputVolts(this.netlist.netOf(board.partId, pinId), pinId)
      this.runner.setDigitalInput(pinId, volts > LOGIC_HIGH_THRESHOLD)
      this.runner.setAnalogInput(pinId, volts)
    }
  }

  /** 每帧运行 CPU 之后调用：计算各元件的显示状态 */
  readStates(): Record<string, PartSimState> {
    const states: Record<string, PartSimState> = {}
    const board = this.netlist.board
    for (const part of this.doc.parts) {
      if (part.type === 'led')
        states[part.id] = { brightness: this.ledBrightness(part) }
      else if (part.type === 'button')
        states[part.id] = { pressed: this.pressed.has(part.id) }
      else if (part.type === 'buzzer')
        states[part.id] = { frequency: this.buzzerFrequency(part) }
      else if (part.type === 'servo')
        states[part.id] = { angle: this.servoAngle(part) }
      else if (board && part.id === board.partId && board.definition.builtinLed)
        states[part.id] = { brightness: this.ioLevel(board.definition.builtinLed) }
    }
    return states
  }

  private rebuild(): void {
    const links: [string, string][] = [...this.pressed].map(id => [endpointKey(id, '1'), endpointKey(id, '2')])
    this.netlist = buildNetlist(this.doc, links)
    const board = this.netlist.board
    if (board?.definition.builtinLed)
      this.runner.watch(board.definition.builtinLed)
    for (const part of this.doc.parts) {
      for (const pin of ['A', 'C', 'P', 'SIG']) {
        const drive = resolveDrive(this.netlist, this.netlist.netOf(part.id, pin))
        if (drive.kind === 'io')
          this.runner.watch(drive.pin)
      }
    }
  }

  /** IO 引脚当前输出的平均电平（PWM 时为占空比） */
  private ioLevel(pinId: string): number {
    if (!this.runner.isOutput(pinId))
      return 0
    return this.runner.pinStats(pinId)?.duty ?? 0
  }

  private driveLevel(drive: Drive, fallback: number): number {
    switch (drive.kind) {
      case 'io': return this.ioLevel(drive.pin)
      case 'power': return 1
      case 'ground': return 0
      default: return fallback
    }
  }

  private ledBrightness(part: CircuitPart): number {
    const anode = resolveDrive(this.netlist, this.netlist.netOf(part.id, 'A'))
    const cathode = resolveDrive(this.netlist, this.netlist.netOf(part.id, 'C'))
    if (anode.kind === 'none' || cathode.kind === 'none')
      return 0
    return Math.max(0, this.driveLevel(anode, 0) - this.driveLevel(cathode, 1))
  }

  private buzzerFrequency(part: CircuitPart): number {
    const drive = resolveDrive(this.netlist, this.netlist.netOf(part.id, 'P'))
    if (drive.kind !== 'io' || !this.netlist.netOf(part.id, 'N').ground)
      return 0
    const frequency = this.runner.pinStats(drive.pin)?.frequency ?? 0
    return frequency >= 20 && frequency <= 20_000 ? frequency : 0
  }

  private servoAngle(part: CircuitPart): number | undefined {
    const drive = resolveDrive(this.netlist, this.netlist.netOf(part.id, 'SIG'), 0)
    const pulse = drive.kind === 'io' ? this.runner.pinStats(drive.pin)?.pulseUs ?? 0 : 0
    if (pulse < SERVO_MIN_US * 0.8 || pulse > SERVO_MAX_US * 1.2)
      return undefined
    const ratio = (pulse - SERVO_MIN_US) / (SERVO_MAX_US - SERVO_MIN_US)
    return Math.max(0, Math.min(180, ratio * 180))
  }

  /** 模拟传感器输出电压 */
  private analogSource(net: Net): number | undefined {
    for (const key of net.endpoints) {
      const [partId, pin] = key.split(':') as [string, string]
      const part = this.doc.parts.find(item => item.id === partId)
      if (part?.type === 'potentiometer' && pin === 'SIG') {
        const top = this.terminalVolts(this.netlist.netOf(part.id, 'VCC'))
        const bottom = this.terminalVolts(this.netlist.netOf(part.id, 'GND'))
        if (top === undefined || bottom === undefined)
          return undefined
        return bottom + ((top - bottom) * Number(part.props?.value ?? 50)) / 100
      }
      if (part?.type === 'ldr' && pin === 'AO') {
        const vcc = this.terminalVolts(this.netlist.netOf(part.id, 'VCC'))
        return vcc === undefined ? undefined : vcc * (1 - Number(part.props?.light ?? 50) / 100)
      }
    }
    return undefined
  }

  private terminalVolts(net: Net): number | undefined {
    if (net.ground)
      return 0
    return net.powerVolts
  }

  /**
   * 输入引脚电压的判定顺序：
   * 直接接 GND/电源/模拟源 → 其他输出引脚 → 经电阻上拉/下拉 → 内部上拉 → 悬空（按低电平处理）
   */
  private inputVolts(net: Net, pinId: string): number {
    if (net.ground)
      return 0
    if (net.powerVolts !== undefined)
      return net.powerVolts
    const analog = this.analogSource(net)
    if (analog !== undefined)
      return analog
    const driver = net.ioPins.find(pin => pin !== pinId && this.runner.isOutput(pin))
    if (driver)
      return this.ioLevel(driver) > 0.5 ? 5 : 0
    for (const link of this.netlist.resistorLinks(net)) {
      if (link.net.ground)
        return 0
      if (link.net.powerVolts !== undefined)
        return link.net.powerVolts
    }
    return this.runner.isPullUp(pinId) ? 5 : 0
  }
}
