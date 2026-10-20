import type { Note, NoteInput } from '@mcu/shared'
import type { Database } from './index'
import { createId, nowIso } from '../utils/id'

interface NoteRow {
  id: string
  title: string
  content: string
  ref: string | null
  created_at: string
  updated_at: string
}

function toNote(row: NoteRow): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    ref: row.ref,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function createNoteRepo(db: Database) {
  return {
    list(ref?: string): Note[] {
      const rows = ref
        ? db.prepare('SELECT * FROM notes WHERE ref = ? ORDER BY updated_at DESC').all(ref)
        : db.prepare('SELECT * FROM notes ORDER BY updated_at DESC').all()
      return (rows as unknown as NoteRow[]).map(toNote)
    },

    get(id: string): Note | undefined {
      const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as unknown as NoteRow | undefined
      return row ? toNote(row) : undefined
    },

    create(input: NoteInput): Note {
      const id = createId()
      const now = nowIso()
      db.prepare('INSERT INTO notes (id, title, content, ref, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, input.title, input.content, input.ref ?? null, now, now)
      return this.get(id)!
    },

    update(id: string, patch: Partial<NoteInput>): Note | undefined {
      const current = this.get(id)
      if (!current)
        return undefined
      db.prepare('UPDATE notes SET title = ?, content = ?, ref = ?, updated_at = ? WHERE id = ?').run(
        patch.title ?? current.title,
        patch.content ?? current.content,
        patch.ref === undefined ? current.ref ?? null : patch.ref,
        nowIso(),
        id,
      )
      return this.get(id)
    },

    remove(id: string): boolean {
      return Number(db.prepare('DELETE FROM notes WHERE id = ?').run(id).changes) > 0
    },
  }
}

export type NoteRepo = ReturnType<typeof createNoteRepo>
