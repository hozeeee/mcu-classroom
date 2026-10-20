export type AvrPortName = 'B' | 'C' | 'D'

export interface AvrPinRef {
  port: AvrPortName
  bit: number
  /** ADC 通道（仅 A0~A5） */
  adc?: number
}

/** ATmega328P（Uno / Nano）引脚与端口位的对应关系 */
export const UNO_PINS: Record<string, AvrPinRef> = Object.fromEntries([
  ...Array.from({ length: 8 }, (_, bit) => [`D${bit}`, { port: 'D', bit }] as const),
  ...Array.from({ length: 6 }, (_, bit) => [`D${bit + 8}`, { port: 'B', bit }] as const),
  ...Array.from({ length: 6 }, (_, bit) => [`A${bit}`, { port: 'C', bit, adc: bit }] as const),
])

export const AVR_CLOCK_HZ = 16_000_000

/** 仅 Arduino Uno 支持浏览器仿真 */
export const SIMULATED_BOARD_ID = 'arduino-uno'
