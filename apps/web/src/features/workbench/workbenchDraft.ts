import type { CircuitDoc, Project } from '@mcu/shared'
import { DEFAULT_BOARD_ID, DEFAULT_SKETCH, getBoard } from '@mcu/shared'
import { createBoardCircuit, isCircuitDoc } from '../circuit/circuitOps'

/** 工作台编辑的内容：代码 + 电路 + 板子 */
export interface WorkbenchDoc {
  name: string
  boardId: string
  code: string
  circuit: CircuitDoc
}

const DRAFT_KEY = 'mcu-classroom:workbench-draft'

export function createDraft(boardId = DEFAULT_BOARD_ID, code = DEFAULT_SKETCH): WorkbenchDoc {
  return { name: '未命名草稿', boardId, code, circuit: createBoardCircuit(boardId) }
}

/** 读取本地草稿（未保存为项目时自动存在浏览器里） */
export function loadDraft(): WorkbenchDoc {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    const draft = raw ? JSON.parse(raw) as Partial<WorkbenchDoc> : null
    if (draft && typeof draft.code === 'string' && draft.boardId && getBoard(draft.boardId) && isCircuitDoc(draft.circuit))
      return { name: draft.name || '未命名草稿', boardId: draft.boardId, code: draft.code, circuit: draft.circuit }
  }
  catch {}
  return createDraft()
}

export function saveDraft(doc: WorkbenchDoc): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(doc))
  }
  catch {}
}

export function projectToDoc(project: Project): WorkbenchDoc {
  return { name: project.name, boardId: project.boardId, code: project.code, circuit: project.circuit }
}
