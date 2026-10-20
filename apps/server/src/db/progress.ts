import type { ProgressRecord, ProgressStatus, ProgressTargetType } from '@mcu/shared'
import type { Database } from './index'
import { nowIso } from '../utils/id'

interface ProgressRow {
  target_type: ProgressTargetType
  target_id: string
  status: ProgressStatus
  updated_at: string
}

function toRecord(row: ProgressRow): ProgressRecord {
  return {
    targetType: row.target_type,
    targetId: row.target_id,
    status: row.status,
    updatedAt: row.updated_at,
  }
}

export function createProgressRepo(db: Database) {
  return {
    list(): ProgressRecord[] {
      const rows = db.prepare('SELECT * FROM progress ORDER BY updated_at DESC').all() as unknown as ProgressRow[]
      return rows.map(toRecord)
    },

    /** status 为 todo 时删除记录，保持表内只存有进度的条目 */
    set(targetType: ProgressTargetType, targetId: string, status: ProgressStatus): ProgressRecord | null {
      if (status === 'todo') {
        db.prepare('DELETE FROM progress WHERE target_type = ? AND target_id = ?').run(targetType, targetId)
        return null
      }
      const updatedAt = nowIso()
      db.prepare(`
        INSERT INTO progress (target_type, target_id, status, updated_at) VALUES (?, ?, ?, ?)
        ON CONFLICT (target_type, target_id) DO UPDATE SET status = excluded.status, updated_at = excluded.updated_at
      `).run(targetType, targetId, status, updatedAt)
      return { targetType, targetId, status, updatedAt }
    },

    reset(): void {
      db.exec('DELETE FROM progress')
    },
  }
}

export type ProgressRepo = ReturnType<typeof createProgressRepo>
