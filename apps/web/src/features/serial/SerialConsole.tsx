import type { SerialEntry, SerialFormatOptions } from './serialLog'
import { useEffect, useRef } from 'react'
import { formatEntry } from './serialLog'

interface SerialConsoleProps {
  entries: SerialEntry[]
  options: SerialFormatOptions
  placeholder?: string
}

/** 距底部小于该像素时视为“跟随最新输出” */
const STICK_THRESHOLD = 24

/** 串口输出区：用户向上翻看时暂停自动滚动 */
export function SerialConsole({ entries, options, placeholder = '暂无数据' }: SerialConsoleProps) {
  const ref = useRef<HTMLPreElement>(null)
  const stickRef = useRef(true)

  useEffect(() => {
    const el = ref.current
    if (el && stickRef.current)
      el.scrollTop = el.scrollHeight
  }, [entries])

  const onScroll = () => {
    const el = ref.current
    if (el)
      stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < STICK_THRESHOLD
  }

  return (
    <pre ref={ref} className="log-panel" onScroll={onScroll}>
      {entries.length === 0
        ? <span className="info">{placeholder}</span>
        : entries.map(entry => (
            <div key={entry.id} className={entry.dir === 'rx' ? undefined : entry.dir}>
              {formatEntry(entry, options)}
            </div>
          ))}
    </pre>
  )
}
