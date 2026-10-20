import type { TaskLogLine } from '../stores/tasks'
import { useEffect, useRef } from 'react'
import { useTaskEntry } from '../hooks/useTaskRunner'

interface TaskLogPanelProps {
  taskId?: string
  /** 无任务时的提示文字 */
  placeholder?: string
  height?: number | string
}

function LogLine({ log }: { log: TaskLogLine }) {
  return <div className={log.stream}>{log.line}</div>
}

/** 实时显示后端任务（安装、编译、烧录）的输出，自动滚动到底部 */
export function TaskLogPanel({ taskId, placeholder = '暂无输出', height = 240 }: TaskLogPanelProps) {
  const entry = useTaskEntry(taskId)
  const ref = useRef<HTMLPreElement>(null)
  const logs = entry?.logs ?? []

  useEffect(() => {
    const el = ref.current
    if (el)
      el.scrollTop = el.scrollHeight
  }, [logs.length])

  return (
    <pre ref={ref} className="log-panel" style={{ height }}>
      {logs.length === 0
        ? <span className="info">{placeholder}</span>
        : logs.map((log, index) => (
            // eslint-disable-next-line react/no-array-index-key -- 日志只追加、不重排，序号就是稳定标识
            <LogLine key={index} log={log} />
          ))}
      {entry?.info?.status === 'failed' && entry.info.error && <div className="stderr">{`✖ ${entry.info.error}`}</div>}
    </pre>
  )
}
