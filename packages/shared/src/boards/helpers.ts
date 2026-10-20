import type { BoardPin, PinKind } from '../types/board'

type PinSpec = [id: string, label: string, kinds: PinKind[], functions?: string[]]

/** 简化引脚定义：pins('left', [['D13', 'D13', ['digital'], ['SCK']]]) */
export function pins(side: BoardPin['side'], specs: PinSpec[]): BoardPin[] {
  return specs.map(([id, label, kinds, functions]) => ({ id, label, kinds, functions, side }))
}

export const POWER: PinKind[] = ['power']
export const GROUND: PinKind[] = ['ground']
export const DIGITAL: PinKind[] = ['digital']
export const PWM: PinKind[] = ['digital', 'pwm']
export const ANALOG: PinKind[] = ['digital', 'analog']
export const CONTROL: PinKind[] = ['control']
