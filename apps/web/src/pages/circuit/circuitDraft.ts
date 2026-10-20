import type { CircuitDoc } from '@mcu/shared'
import { DEFAULT_BOARD_ID } from '@mcu/shared'
import { createBoardCircuit, isCircuitDoc } from '../../features/circuit/circuitOps'

const DRAFT_KEY = 'mcu-classroom:circuit-draft'

export function loadCircuitDraft(): CircuitDoc {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    const doc: unknown = raw ? JSON.parse(raw) : null
    if (isCircuitDoc(doc))
      return doc
  }
  catch {}
  return createBoardCircuit(DEFAULT_BOARD_ID)
}

export function saveCircuitDraft(doc: CircuitDoc): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(doc))
  }
  catch {}
}
