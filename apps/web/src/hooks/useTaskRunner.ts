import type { TaskInfo } from '@mcu/shared'
import { useCallback, useState } from 'react'
import { api } from '../api'
import { isTaskFinished, useTaskStore } from '../stores/tasks'

const POLL_INTERVAL = 1500

/** 等待任务结束：实时日志来自 WS，同时轮询接口兜底 */
export function waitForTask(id: string): Promise<TaskInfo> {
  return new Promise((resolve) => {
    let timer: ReturnType<typeof setInterval> | undefined
    let unsubscribe = () => {}
    const finish = (info: TaskInfo) => {
      unsubscribe()
      clearInterval(timer)
      resolve(info)
    }
    unsubscribe = useTaskStore.subscribe((state) => {
      const info = state.tasks[id]?.info
      if (info && isTaskFinished(info))
        finish(info)
    })
    timer = setInterval(async () => {
      try {
        const { logs, ...info } = await api.task(id)
        useTaskStore.getState().merge(info, logs)
        if (isTaskFinished(info))
          finish(info)
      }
      catch {}
    }, POLL_INTERVAL)
  })
}

/**
 * 启动后端任务并跟踪日志：
 * const { run, taskId, running } = useTaskRunner()
 * const info = await run(() => api.compile(...))
 */
export function useTaskRunner() {
  const [taskId, setTaskId] = useState<string>()
  const [running, setRunning] = useState(false)

  const run = useCallback(async (start: () => Promise<TaskInfo>): Promise<TaskInfo> => {
    setRunning(true)
    try {
      const info = await start()
      setTaskId(info.id)
      return await waitForTask(info.id)
    }
    finally {
      setRunning(false)
    }
  }, [])

  return { run, taskId, running }
}

export function useTaskEntry(id: string | undefined) {
  return useTaskStore(state => (id ? state.tasks[id] : undefined))
}
