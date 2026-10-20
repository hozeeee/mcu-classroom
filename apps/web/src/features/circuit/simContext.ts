import type { CircuitPart } from '@mcu/shared'
import type { PartSimState } from './parts/types'
import { createContext, use } from 'react'

export interface CircuitInteraction {
  /** 是否可编辑（拖拽、连线、改属性） */
  editable: boolean
  /** 仿真是否在运行 */
  running: boolean
  sim: Record<string, PartSimState>
  pressButton: (partId: string, pressed: boolean) => void
  setPartProps: (partId: string, patch: NonNullable<CircuitPart['props']>) => void
}

function noop() {}

export const CircuitInteractionContext = createContext<CircuitInteraction>({
  editable: false,
  running: false,
  sim: {},
  pressButton: noop,
  setPartProps: noop,
})

export function useCircuitInteraction(): CircuitInteraction {
  return use(CircuitInteractionContext)
}
