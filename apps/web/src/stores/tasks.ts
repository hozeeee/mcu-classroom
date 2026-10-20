import type { TaskEvent, TaskInfo } from '@mcu/shared'
import { create } from 'zustand'

export interface TaskLogLine {
  line: string
  stream: 'stdout' | 'stderr' | 'info'
}

interface TaskEntry {
  info?: TaskInfo
  logs: TaskLogLine[]
}

interface TaskState {
  tasks: Record<string, TaskEntry>
  apply: (event: TaskEvent) => void
  /** 轮询兜底：WS 断线时用接口返回的完整数据覆盖 */
  merge: (info: TaskInfo, logs: string[]) => void
}

const MAX_LOGS = 3000

export const useTaskStore = create<TaskState>(set => ({
  tasks: {},
  apply: event => set((state) => {
    const id = event.type === 'log' ? event.taskId : event.task.id
    const entry = state.tasks[id] ?? { logs: [] }
    const next: TaskEntry = event.type === 'log'
      ? { ...entry, logs: [...entry.logs, { line: event.line, stream: event.stream }].slice(-MAX_LOGS) }
      : { ...entry, info: event.task }
    return { tasks: { ...state.tasks, [id]: next } }
  }),
  merge: (info, logs) => set((state) => {
    const entry = state.tasks[info.id] ?? { logs: [] }
    const mergedLogs = logs.length > entry.logs.length
      ? logs.map(line => ({ line, stream: line.startsWith('✖') ? 'stderr' as const : 'info' as const }))
      : entry.logs
    return { tasks: { ...state.tasks, [info.id]: { info, logs: mergedLogs } } }
  }),
}))

export function isTaskFinished(info?: TaskInfo): boolean {
  return info?.status === 'success' || info?.status === 'failed'
}
