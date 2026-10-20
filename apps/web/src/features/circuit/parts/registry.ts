import type { PartCategory, PartDefinition } from './types'
import { BASIC_PARTS } from './basic'
import { BOARD_PARTS } from './boards'
import { MODULE_PARTS } from './modules'

export const PART_LIBRARY: PartDefinition[] = [...BOARD_PARTS, ...BASIC_PARTS, ...MODULE_PARTS]

const PART_MAP = new Map(PART_LIBRARY.map(item => [item.type, item]))

export function getPartDefinition(type: string): PartDefinition | undefined {
  return PART_MAP.get(type)
}

export const PART_CATEGORY_LABELS: Record<PartCategory, string> = {
  board: '开发板',
  basic: '基础元件',
  input: '输入',
  output: '输出',
  sensor: '传感器',
  module: '模块',
  tool: '工具',
}
