import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import { MIGRATIONS } from './migrations'

export type Database = DatabaseSync

/** 打开（或创建）SQLite 数据库并执行未应用的迁移 */
export function openDatabase(dataDir: string): Database {
  mkdirSync(dataDir, { recursive: true })
  const db = new DatabaseSync(path.join(dataDir, 'data.db'))
  db.exec('PRAGMA journal_mode = WAL')
  db.exec('PRAGMA foreign_keys = ON')
  migrate(db)
  return db
}

function migrate(db: Database): void {
  db.exec('CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL)')
  const row = db.prepare('SELECT MAX(version) AS version FROM schema_version').get() as { version: number | null } | undefined
  const current = row?.version ?? 0

  for (const [index, sql] of MIGRATIONS.entries()) {
    const version = index + 1
    if (version <= current)
      continue
    db.exec('BEGIN')
    try {
      db.exec(sql)
      db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(version)
      db.exec('COMMIT')
    }
    catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }
}
