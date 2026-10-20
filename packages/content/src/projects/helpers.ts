import type { CircuitDoc, CircuitPart, CircuitWire } from '@mcu/shared'

/** 导线颜色约定：红=电源，黑=地，其他颜色=信号 */
export const WIRE = {
  power: '#e53935',
  ground: '#212121',
  signal: '#fb8c00',
  signal2: '#1e88e5',
  signal3: '#43a047',
  signal4: '#8e24aa',
} as const

export function part(id: string, type: string, x: number, y: number, props?: CircuitPart['props']): CircuitPart {
  return { id, type, x, y, props }
}

/** wire('uno:D13', 'r1:1') —— 冒号前为元件 id，冒号后为引脚 id */
export function wire(from: string, to: string, color: string = WIRE.signal): Omit<CircuitWire, 'id'> {
  const [fromPart, fromPin] = from.split(':') as [string, string]
  const [toPart, toPin] = to.split(':') as [string, string]
  return { from: { part: fromPart, pin: fromPin }, to: { part: toPart, pin: toPin }, color }
}

export function circuit(parts: CircuitPart[], wires: Omit<CircuitWire, 'id'>[]): CircuitDoc {
  return {
    version: 1,
    parts,
    wires: wires.map((item, index) => ({ ...item, id: `w${index + 1}` })),
  }
}

/** 一组「电阻 + LED」的常用接法：信号引脚 → 电阻 → LED 阳极，LED 阴极 → GND */
export function ledWithResistor(options: {
  board: string
  signalPin: string
  groundPin: string
  index: number
  x: number
  y: number
  color?: string
  ohms?: number
  wireColor?: string
}) {
  const { board, signalPin, groundPin, index, x, y, color = 'red', ohms = 220, wireColor = WIRE.signal } = options
  const resistorId = `r${index}`
  const ledId = `led${index}`
  return {
    parts: [
      part(resistorId, 'resistor', x, y + 8, { ohms }),
      part(ledId, 'led', x + 130, y, { color }),
    ],
    wires: [
      wire(`${board}:${signalPin}`, `${resistorId}:1`, wireColor),
      wire(`${resistorId}:2`, `${ledId}:A`, wireColor),
      wire(`${ledId}:C`, `${board}:${groundPin}`, WIRE.ground),
    ],
  }
}
