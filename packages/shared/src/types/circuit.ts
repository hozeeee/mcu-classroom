export interface CircuitPart {
  id: string
  /** 元件类型，对应前端元件库中的 type，如 led / resistor / board:arduino-uno */
  type: string
  x: number
  y: number
  /** 旋转角度：0 / 90 / 180 / 270 */
  rotation?: number
  props?: Record<string, string | number | boolean>
}

export interface CircuitEndpoint {
  part: string
  pin: string
}

export interface CircuitWire {
  id: string
  from: CircuitEndpoint
  to: CircuitEndpoint
  color?: string
}

export interface CircuitDoc {
  version: 1
  parts: CircuitPart[]
  wires: CircuitWire[]
}

export function createEmptyCircuit(): CircuitDoc {
  return { version: 1, parts: [], wires: [] }
}
