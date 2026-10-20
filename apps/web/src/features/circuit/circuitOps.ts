import type { CircuitDoc, CircuitPart } from '@mcu/shared'
import { BOARD_PART_PREFIX, boardPartType, isBoardPart } from './parts/boards'
import { getPartDefinition } from './parts/registry'

export function partHasPin(part: CircuitPart | undefined, pinId: string): boolean {
  return Boolean(part && getPartDefinition(part.type)?.pins.some(pin => pin.id === pinId))
}

/** 删除指向不存在元件或引脚的导线 */
export function pruneWires(doc: CircuitDoc): CircuitDoc {
  const parts = new Map(doc.parts.map(part => [part.id, part]))
  return {
    ...doc,
    wires: doc.wires.filter(wire => partHasPin(parts.get(wire.from.part), wire.from.pin) && partHasPin(parts.get(wire.to.part), wire.to.pin)),
  }
}

export function findBoardPart(doc: CircuitDoc): CircuitPart | undefined {
  return doc.parts.find(part => isBoardPart(part.type))
}

/** 电路中主控板对应的 boardId（没有板子时返回 undefined） */
export function boardIdOf(doc: CircuitDoc): string | undefined {
  return findBoardPart(doc)?.type.slice(BOARD_PART_PREFIX.length)
}

/** 切换开发板：替换电路中的主控板（没有则新增），同名引脚上的导线会保留 */
export function replaceBoard(doc: CircuitDoc, boardId: string): CircuitDoc {
  const type = boardPartType(boardId)
  const current = findBoardPart(doc)
  if (current?.type === type)
    return doc
  const parts = current
    ? doc.parts.map(part => (part.id === current.id ? { ...part, type } : part))
    : [{ id: 'board', type, x: 0, y: 0 }, ...doc.parts]
  return pruneWires({ ...doc, parts })
}

/** 新建项目时的初始电路：只有一块开发板 */
export function createBoardCircuit(boardId: string): CircuitDoc {
  return { version: 1, parts: [{ id: 'board', type: boardPartType(boardId), x: 0, y: 0 }], wires: [] }
}

export function isCircuitDoc(value: unknown): value is CircuitDoc {
  const doc = value as CircuitDoc | null
  return Boolean(doc && doc.version === 1 && Array.isArray(doc.parts) && Array.isArray(doc.wires))
}
