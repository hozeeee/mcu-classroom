import type { CircuitDoc, Project, ProjectInput, ProjectSummary } from '@mcu/shared'
import type { Database } from './index'
import { createEmptyCircuit, DEFAULT_SKETCH } from '@mcu/shared'
import { createId, nowIso } from '../utils/id'

interface ProjectRow {
  id: string
  name: string
  board_id: string
  code: string
  circuit: string
  example_id: string | null
  created_at: string
  updated_at: string
}

function toSummary(row: ProjectRow): ProjectSummary {
  return {
    id: row.id,
    name: row.name,
    boardId: row.board_id,
    exampleId: row.example_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function parseCircuit(raw: string): CircuitDoc {
  try {
    return JSON.parse(raw) as CircuitDoc
  }
  catch {
    return createEmptyCircuit()
  }
}

function toProject(row: ProjectRow): Project {
  return { ...toSummary(row), code: row.code, circuit: parseCircuit(row.circuit) }
}

export function createProjectRepo(db: Database) {
  return {
    list(): ProjectSummary[] {
      const rows = db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all() as unknown as ProjectRow[]
      return rows.map(toSummary)
    },

    get(id: string): Project | undefined {
      const row = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as unknown as ProjectRow | undefined
      return row ? toProject(row) : undefined
    },

    create(input: ProjectInput): Project {
      const now = nowIso()
      const id = createId()
      db.prepare(`
        INSERT INTO projects (id, name, board_id, code, circuit, example_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        input.name,
        input.boardId,
        input.code ?? DEFAULT_SKETCH,
        JSON.stringify(input.circuit ?? createEmptyCircuit()),
        input.exampleId ?? null,
        now,
        now,
      )
      return this.get(id)!
    },

    update(id: string, patch: Partial<ProjectInput>): Project | undefined {
      const current = this.get(id)
      if (!current)
        return undefined
      db.prepare(`
        UPDATE projects SET name = ?, board_id = ?, code = ?, circuit = ?, updated_at = ?
        WHERE id = ?
      `).run(
        patch.name ?? current.name,
        patch.boardId ?? current.boardId,
        patch.code ?? current.code,
        JSON.stringify(patch.circuit ?? current.circuit),
        nowIso(),
        id,
      )
      return this.get(id)
    },

    remove(id: string): boolean {
      return Number(db.prepare('DELETE FROM projects WHERE id = ?').run(id).changes) > 0
    },
  }
}

export type ProjectRepo = ReturnType<typeof createProjectRepo>
