import type { BoardDefinition } from '@mcu/shared'
import type { PartDefinition, PinDef } from './types'
import { BOARDS } from '@mcu/shared'
import { BoardVisual } from './visuals/BoardVisual'

const BOARD_WIDTH = 170
const HEADER = 52
const PITCH = 16
const FOOTER = 14

export const BOARD_PART_PREFIX = 'board:'

/** 开发板引脚按 BoardDefinition 中的 side 分左右两列排布 */
function layoutBoardPins(board: BoardDefinition): { pins: PinDef[], height: number } {
  const left = board.pins.filter(pin => pin.side === 'left')
  const right = board.pins.filter(pin => pin.side === 'right')
  const pins = [
    ...left.map((pin, index) => ({ id: pin.id, label: pin.label, x: 0, y: HEADER + index * PITCH })),
    ...right.map((pin, index) => ({ id: pin.id, label: pin.label, x: BOARD_WIDTH, y: HEADER + index * PITCH })),
  ]
  return { pins, height: HEADER + Math.max(left.length, right.length) * PITCH + FOOTER }
}

export function boardPartType(boardId: string): string {
  return `${BOARD_PART_PREFIX}${boardId}`
}

export function isBoardPart(type: string): boolean {
  return type.startsWith(BOARD_PART_PREFIX)
}

export const BOARD_PARTS: PartDefinition[] = BOARDS.map((board) => {
  const { pins, height } = layoutBoardPins(board)
  return {
    type: boardPartType(board.id),
    name: board.name,
    category: 'board',
    description: `${board.mcu} · ${board.clock} · ${board.logicVoltage} 逻辑电平`,
    width: BOARD_WIDTH,
    height,
    pins,
    simulatable: board.simulatable,
    Visual: BoardVisual,
  }
})
