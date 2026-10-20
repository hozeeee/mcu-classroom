import type { CompileResult, TaskEvent, TaskInfo, TaskKind } from '@mcu/shared'
import { EventEmitter } from 'node:events'
import { errorMessage } from '../utils/errors'
import { createId, nowIso } from '../utils/id'

export interface TaskContext {
  /** 输出一行日志，实时推送到前端 */
  log: (line: string, stream?: 'stdout' | 'stderr' | 'info') => void
}

type TaskRunner = (ctx: TaskContext) => Promise<CompileResult | null | void>

const MAX_TASKS = 50
const MAX_LOG_LINES = 2000

interface TaskRecord {
  info: TaskInfo
  logs: string[]
}

/**
 * 长耗时任务（安装、编译、烧录）管理器：
 * - 立即返回 TaskInfo，前端通过 WS /ws/tasks 订阅日志与状态
 * - 所有任务串行执行，避免 arduino-cli 并发写同一目录
 */
export class TaskManager {
  private tasks = new Map<string, TaskRecord>()
  private events = new EventEmitter()
  private queue: Promise<unknown> = Promise.resolve()

  constructor() {
    this.events.setMaxListeners(100)
  }

  list(): TaskInfo[] {
    return [...this.tasks.values()].map(item => item.info).reverse()
  }

  get(id: string): (TaskInfo & { logs: string[] }) | undefined {
    const record = this.tasks.get(id)
    return record ? { ...record.info, logs: record.logs } : undefined
  }

  subscribe(listener: (event: TaskEvent) => void): () => void {
    this.events.on('event', listener)
    return () => this.events.off('event', listener)
  }

  /** 是否有同类任务正在执行 */
  isBusy(kind: TaskKind): boolean {
    return [...this.tasks.values()].some(item => item.info.kind === kind && (item.info.status === 'running' || item.info.status === 'pending'))
  }

  start(kind: TaskKind, title: string, runner: TaskRunner): TaskInfo {
    const info: TaskInfo = { id: createId(), kind, title, status: 'pending', createdAt: nowIso() }
    const record: TaskRecord = { info, logs: [] }
    this.tasks.set(info.id, record)
    this.prune()
    this.emitStatus(record)

    const ctx: TaskContext = {
      log: (line, stream = 'info') => {
        if (record.logs.length < MAX_LOG_LINES)
          record.logs.push(line)
        this.events.emit('event', { type: 'log', taskId: info.id, line, stream } satisfies TaskEvent)
      },
    }

    this.queue = this.queue.then(async () => {
      info.status = 'running'
      this.emitStatus(record)
      try {
        const result = await runner(ctx)
        info.result = result ?? null
        info.status = 'success'
      }
      catch (error) {
        info.status = 'failed'
        info.error = errorMessage(error)
        ctx.log(`✖ ${info.error}`, 'stderr')
      }
      info.finishedAt = nowIso()
      this.emitStatus(record)
    })

    return { ...info }
  }

  private emitStatus(record: TaskRecord): void {
    this.events.emit('event', { type: 'status', task: { ...record.info } } satisfies TaskEvent)
  }

  private prune(): void {
    if (this.tasks.size <= MAX_TASKS)
      return
    for (const [id, record] of this.tasks) {
      if (this.tasks.size <= MAX_TASKS)
        break
      if (record.info.status === 'success' || record.info.status === 'failed')
        this.tasks.delete(id)
    }
  }
}
