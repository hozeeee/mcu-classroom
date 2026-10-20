import type { CircuitDoc } from './circuit'

export interface Project {
  id: string
  name: string
  boardId: string
  code: string
  circuit: CircuitDoc
  /** 来自哪个示例项目 */
  exampleId?: string | null
  createdAt: string
  updatedAt: string
}

export type ProjectSummary = Omit<Project, 'code' | 'circuit'>

export interface ProjectInput {
  name: string
  boardId: string
  code?: string
  circuit?: CircuitDoc
  exampleId?: string | null
}

export type ProgressTargetType = 'article' | 'project'

export type ProgressStatus = 'todo' | 'doing' | 'done'

export interface ProgressRecord {
  targetType: ProgressTargetType
  targetId: string
  status: ProgressStatus
  updatedAt: string
}

export interface Note {
  id: string
  title: string
  content: string
  /** 关联的文章或项目，如 article:what-is-mcu */
  ref?: string | null
  createdAt: string
  updatedAt: string
}

export interface NoteInput {
  title: string
  content: string
  ref?: string | null
}
