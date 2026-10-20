export type BoardFamily = 'avr' | 'esp32' | 'stm32' | 'rp2040'

export type PinKind = 'digital' | 'analog' | 'pwm' | 'power' | 'ground' | 'control'

export interface BoardPin {
  /** 电路编辑器与仿真使用的唯一引脚 ID，如 D13 / A0 / GND1 */
  id: string
  /** 板子丝印上的名字 */
  label: string
  kinds: PinKind[]
  /** 复用功能，如 PWM、SDA、TX */
  functions?: string[]
  /** 在电路编辑器中所在的一侧 */
  side: 'left' | 'right'
}

export interface BoardCore {
  /** arduino-cli 中的 core id，如 arduino:avr */
  id: string
  name: string
  /** 第三方 core 需要的 board manager 索引地址 */
  indexUrl?: string
  /** 下载体积提示 */
  sizeHint: string
  description: string
}

export interface BoardDefinition {
  id: string
  name: string
  family: BoardFamily
  /** Fully Qualified Board Name，arduino-cli 编译/烧录时使用 */
  fqbn: string
  coreId: string
  mcu: string
  clock: string
  flash: string
  ram: string
  /** IO 逻辑电平 */
  logicVoltage: string
  /** 是否支持浏览器内仿真 */
  simulatable: boolean
  /** 板载 LED 所在引脚 */
  builtinLed?: string
  description: string
  uploadHint: string
  pins: BoardPin[]
}
