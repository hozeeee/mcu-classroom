import type { CircuitPart } from '@mcu/shared'
import type { ComponentType } from 'react'

/** 元件引脚：坐标相对元件左上角（未旋转时） */
export interface PinDef {
  id: string
  label: string
  x: number
  y: number
}

export type PartCategory = 'board' | 'basic' | 'input' | 'output' | 'sensor' | 'module' | 'tool'

export interface PropField {
  key: string
  label: string
  type: 'number' | 'select' | 'slider'
  options?: { label: string, value: string }[]
  min?: number
  max?: number
  step?: number
  unit?: string
}

/** 仿真运行时元件的可视状态 */
export interface PartSimState {
  /** LED 亮度 0~1 */
  brightness?: number
  /** 按键是否按下 */
  pressed?: boolean
  /** 蜂鸣器频率（Hz），0 表示静音 */
  frequency?: number
  /** 舵机角度 0~180 */
  angle?: number
}

export interface PartVisualProps {
  part: CircuitPart
  definition: PartDefinition
  sim?: PartSimState
}

export interface PartDefinition {
  type: string
  name: string
  category: PartCategory
  description: string
  width: number
  height: number
  pins: PinDef[]
  defaultProps?: CircuitPart['props']
  fields?: PropField[]
  /** 是否支持浏览器仿真 */
  simulatable: boolean
  Visual: ComponentType<PartVisualProps>
}
