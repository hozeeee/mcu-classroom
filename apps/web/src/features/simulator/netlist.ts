import type { BoardDefinition, CircuitDoc } from '@mcu/shared'
import { getBoard } from '@mcu/shared'
import { BOARD_PART_PREFIX } from '../circuit/parts/boards'

export function endpointKey(part: string, pin: string): string {
  return `${part}:${pin}`
}

class UnionFind {
  private parent = new Map<string, string>()

  find(key: string): string {
    let root = this.parent.get(key) ?? key
    if (root !== key) {
      root = this.find(root)
      this.parent.set(key, root)
    }
    return root
  }

  union(a: string, b: string): void {
    const rootA = this.find(a)
    const rootB = this.find(b)
    if (rootA !== rootB)
      this.parent.set(rootA, rootB)
  }
}

/** 一个电气网络：导线直接连在一起的所有引脚 */
export interface Net {
  id: string
  endpoints: string[]
  /** 主控板上的 IO 引脚（如 D13、A0） */
  ioPins: string[]
  /** 网络上的电源电压（接 5V / 3.3V 等），没有则为 undefined */
  powerVolts?: number
  ground: boolean
}

export interface ResistorLink {
  partId: string
  ohms: number
  net: Net
}

export interface Netlist {
  board?: { partId: string, definition: BoardDefinition }
  netOf: (part: string, pin: string) => Net
  /** 与该网络通过电阻相连的网络 */
  resistorLinks: (net: Net) => ResistorLink[]
  nets: Net[]
}

function powerVoltsOf(label: string): number {
  return /3\.?3/.test(label) ? 3.3 : 5
}

/**
 * 把电路图转换为网络表：
 * - 导线与 extraLinks（如按下的按键）把两端合并为同一网络
 * - 开发板的多个 GND 引脚在板内是连通的
 * - 电阻不合并网络，而是作为网络之间的"边"记录下来
 */
export function buildNetlist(doc: CircuitDoc, extraLinks: [string, string][] = []): Netlist {
  const uf = new UnionFind()
  for (const wire of doc.wires)
    uf.union(endpointKey(wire.from.part, wire.from.pin), endpointKey(wire.to.part, wire.to.pin))
  for (const [a, b] of extraLinks)
    uf.union(a, b)

  const boardParts = doc.parts.filter(part => part.type.startsWith(BOARD_PART_PREFIX))
  const mainBoardPart = boardParts[0]
  const mainBoard = mainBoardPart ? getBoard(mainBoardPart.type.slice(BOARD_PART_PREFIX.length)) : undefined

  const pinClasses = new Map<string, { io?: string, powerVolts?: number, ground?: boolean }>()
  for (const part of boardParts) {
    const board = getBoard(part.type.slice(BOARD_PART_PREFIX.length))
    if (!board)
      continue
    let firstGround: string | undefined
    for (const pin of board.pins) {
      const key = endpointKey(part.id, pin.id)
      if (pin.kinds.includes('ground')) {
        pinClasses.set(key, { ground: true })
        if (firstGround)
          uf.union(firstGround, key)
        firstGround ??= key
      }
      else if (pin.kinds.includes('power') && pin.id !== 'IOREF') {
        pinClasses.set(key, { powerVolts: powerVoltsOf(pin.label) })
      }
      else if (part === mainBoardPart && (pin.kinds.includes('digital') || pin.kinds.includes('analog'))) {
        pinClasses.set(key, { io: pin.id })
      }
    }
  }

  const netMap = new Map<string, Net>()
  const netOf = (part: string, pin: string): Net => {
    const key = endpointKey(part, pin)
    const root = uf.find(key)
    let net = netMap.get(root)
    if (!net) {
      net = { id: root, endpoints: [], ioPins: [], ground: false }
      netMap.set(root, net)
    }
    if (!net.endpoints.includes(key)) {
      net.endpoints.push(key)
      const info = pinClasses.get(key)
      if (info?.io)
        net.ioPins.push(info.io)
      if (info?.ground)
        net.ground = true
      if (info?.powerVolts !== undefined)
        net.powerVolts = Math.max(net.powerVolts ?? 0, info.powerVolts)
    }
    return net
  }

  // 先把所有出现过的端点登记到网络中
  for (const wire of doc.wires) {
    netOf(wire.from.part, wire.from.pin)
    netOf(wire.to.part, wire.to.pin)
  }
  for (const key of pinClasses.keys()) {
    const index = key.lastIndexOf(':')
    netOf(key.slice(0, index), key.slice(index + 1))
  }

  const links = new Map<string, ResistorLink[]>()
  for (const part of doc.parts.filter(item => item.type === 'resistor')) {
    const a = netOf(part.id, '1')
    const b = netOf(part.id, '2')
    const ohms = Number(part.props?.ohms ?? 220)
    links.set(a.id, [...(links.get(a.id) ?? []), { partId: part.id, ohms, net: b }])
    links.set(b.id, [...(links.get(b.id) ?? []), { partId: part.id, ohms, net: a }])
  }

  return {
    board: mainBoardPart && mainBoard ? { partId: mainBoardPart.id, definition: mainBoard } : undefined,
    netOf,
    resistorLinks: net => links.get(net.id) ?? [],
    get nets() {
      return [...netMap.values()]
    },
  }
}

export type Drive
  = | { kind: 'io', pin: string, resistors: number }
    | { kind: 'power', volts: number, resistors: number }
    | { kind: 'ground', resistors: number }
    | { kind: 'none' }

/**
 * 从某个网络出发（可经过最多 maxDepth 个电阻），找到最近的驱动源：
 * IO 引脚 / 电源 / GND。同一层级优先级：GND > 电源 > IO
 */
export function resolveDrive(netlist: Netlist, start: Net, maxDepth = 3, skip?: (net: Net) => boolean): Drive {
  const visited = new Set([start.id])
  let layer = [start]
  for (let depth = 0; depth <= maxDepth && layer.length; depth++) {
    const usable = layer.filter(net => !skip?.(net) || net === start)
    const ground = usable.find(net => net.ground)
    if (ground)
      return { kind: 'ground', resistors: depth }
    const power = usable.find(net => net.powerVolts !== undefined)
    if (power)
      return { kind: 'power', volts: power.powerVolts!, resistors: depth }
    const io = usable.find(net => net.ioPins.length)
    if (io)
      return { kind: 'io', pin: io.ioPins[0]!, resistors: depth }
    const next: Net[] = []
    for (const net of layer) {
      for (const link of netlist.resistorLinks(net)) {
        if (!visited.has(link.net.id)) {
          visited.add(link.net.id)
          next.push(link.net)
        }
      }
    }
    layer = next
  }
  return { kind: 'none' }
}
