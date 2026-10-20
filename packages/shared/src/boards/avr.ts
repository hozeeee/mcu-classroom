import type { BoardDefinition, BoardPin } from '../types/board'
import { ANALOG, CONTROL, DIGITAL, GROUND, pins, POWER, PWM } from './helpers'

/** Uno 与 Nano 使用同一颗 ATmega328P，引脚功能一致 */
export const ATMEGA328_PINS: BoardPin[] = [
  ...pins('left', [
    ['IOREF', 'IOREF', POWER],
    ['RESET', 'RESET', CONTROL],
    ['3V3', '3.3V', POWER],
    ['5V', '5V', POWER],
    ['GND1', 'GND', GROUND],
    ['GND2', 'GND', GROUND],
    ['VIN', 'VIN', POWER],
    ['A0', 'A0', ANALOG, ['ADC0']],
    ['A1', 'A1', ANALOG, ['ADC1']],
    ['A2', 'A2', ANALOG, ['ADC2']],
    ['A3', 'A3', ANALOG, ['ADC3']],
    ['A4', 'A4', ANALOG, ['ADC4', 'SDA']],
    ['A5', 'A5', ANALOG, ['ADC5', 'SCL']],
  ]),
  ...pins('right', [
    ['AREF', 'AREF', CONTROL],
    ['GND3', 'GND', GROUND],
    ['D13', 'D13', DIGITAL, ['SCK', 'LED']],
    ['D12', 'D12', DIGITAL, ['MISO']],
    ['D11', '~D11', PWM, ['MOSI', 'PWM']],
    ['D10', '~D10', PWM, ['SS', 'PWM']],
    ['D9', '~D9', PWM, ['PWM']],
    ['D8', 'D8', DIGITAL],
    ['D7', 'D7', DIGITAL],
    ['D6', '~D6', PWM, ['PWM']],
    ['D5', '~D5', PWM, ['PWM']],
    ['D4', 'D4', DIGITAL],
    ['D3', '~D3', PWM, ['PWM', 'INT1']],
    ['D2', 'D2', DIGITAL, ['INT0']],
    ['D1', 'D1', DIGITAL, ['TX']],
    ['D0', 'D0', DIGITAL, ['RX']],
  ]),
]

export const arduinoUno: BoardDefinition = {
  id: 'arduino-uno',
  name: 'Arduino Uno R3',
  family: 'avr',
  fqbn: 'arduino:avr:uno',
  coreId: 'arduino:avr',
  mcu: 'ATmega328P (8 位 AVR)',
  clock: '16 MHz',
  flash: '32 KB',
  ram: '2 KB',
  logicVoltage: '5V',
  simulatable: true,
  builtinLed: 'D13',
  description: '最经典的入门开发板，资料最多，5V 逻辑电平对新手更“耐操”。本站可在浏览器内直接仿真。',
  uploadHint: 'USB 线连接电脑即可烧录（板载 ATmega16U2 或 CH340 USB 转串口）。',
  pins: ATMEGA328_PINS,
}

export const arduinoNano: BoardDefinition = {
  ...arduinoUno,
  id: 'arduino-nano',
  name: 'Arduino Nano',
  fqbn: 'arduino:avr:nano:cpu=atmega328old',
  description: '与 Uno 同芯片的小尺寸版本，可直接插在面包板上。国产兼容板多为旧版 bootloader（atmega328old）。',
  uploadHint: '若烧录报 not in sync，可尝试在 FQBN 中把 cpu=atmega328old 改成 cpu=atmega328。',
}
