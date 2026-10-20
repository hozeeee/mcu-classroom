import type { CircuitDoc, CircuitPart, CircuitWire } from '@mcu/shared'
import type { Edge, Node } from '@xyflow/react'
import { pruneWires } from './circuitOps'
import { DEFAULT_WIRE_COLOR } from './parts/constants'

export interface PartNodeData extends Record<string, unknown> {
  part: CircuitPart
}

export type PartNodeType = Node<PartNodeData, 'part'>

export interface WireEdgeData extends Record<string, unknown> {
  color: string
}

export type WireEdgeType = Edge<WireEdgeData>

export function wireEdgeStyle(color: string) {
  return { stroke: color, strokeWidth: 3 }
}

export function partToNode(part: CircuitPart): PartNodeType {
  return { id: part.id, type: 'part', position: { x: part.x, y: part.y }, data: { part } }
}

export function wireToEdge(wire: CircuitWire): WireEdgeType {
  const color = wire.color ?? DEFAULT_WIRE_COLOR
  return {
    id: wire.id,
    source: wire.from.part,
    sourceHandle: wire.from.pin,
    target: wire.to.part,
    targetHandle: wire.to.pin,
    type: 'smoothstep',
    style: wireEdgeStyle(color),
    data: { color },
  }
}

/** CircuitDoc → React Flow 节点与连线（自动丢弃指向不存在引脚的导线） */
export function circuitToFlow(doc: CircuitDoc) {
  return {
    nodes: doc.parts.map(partToNode),
    edges: pruneWires(doc).wires.map(wireToEdge),
  }
}

export function flowToCircuit(nodes: PartNodeType[], edges: WireEdgeType[]): CircuitDoc {
  return {
    version: 1,
    parts: nodes.map(node => ({
      ...node.data.part,
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
    })),
    wires: edges.map(edge => ({
      id: edge.id,
      from: { part: edge.source, pin: edge.sourceHandle ?? '' },
      to: { part: edge.target, pin: edge.targetHandle ?? '' },
      color: edge.data?.color,
    })),
  }
}

/** 生成不重复的 ID：led1、led2…… */
export function nextId(prefix: string, existing: Iterable<string>): string {
  const used = new Set(existing)
  let index = 1
  while (used.has(`${prefix}${index}`))
    index++
  return `${prefix}${index}`
}

/** 按引脚名猜导线颜色：电源红、地黑、其余橙 */
export function guessWireColor(...pins: (string | null | undefined)[]): string {
  if (pins.some(pin => pin && /GND|^N$|^C$/i.test(pin)))
    return '#212121'
  if (pins.some(pin => pin && /^(?:5V|3V3|VCC|VIN|VBUS)$/i.test(pin)))
    return '#e53935'
  return DEFAULT_WIRE_COLOR
}

const ID_PREFIXES: Record<string, string> = {
  resistor: 'r',
  button: 'btn',
  potentiometer: 'pot',
  buzzer: 'bz',
  servo: 'sv',
  hcsr04: 'us',
  dht11: 'dht',
}

export function partIdPrefix(type: string): string {
  return type.startsWith('board:') ? 'board' : ID_PREFIXES[type] ?? type
}
