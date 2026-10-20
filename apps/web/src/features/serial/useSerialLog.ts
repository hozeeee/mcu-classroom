import type { SerialEntry } from './serialLog'
import { useCallback, useMemo, useState } from 'react'
import { appendSerialBytes, appendSerialText } from './serialLog'

/**
 * 串口收发记录：
 * const log = useSerialLog()
 * log.appendRx(bytes) / log.appendTx('hello') / log.appendInfo('已连接')
 */
export function useSerialLog() {
  const [entries, setEntries] = useState<SerialEntry[]>([])

  const appendRx = useCallback((bytes: Uint8Array) => {
    setEntries(current => appendSerialBytes(current, 'rx', bytes))
  }, [])

  const appendTx = useCallback((text: string) => {
    setEntries(current => appendSerialText(current, 'tx', text.replace(/[\r\n]+$/, '')))
  }, [])

  const appendInfo = useCallback((text: string) => {
    setEntries(current => appendSerialText(current, 'info', text))
  }, [])

  const clear = useCallback(() => setEntries([]), [])

  return useMemo(
    () => ({ entries, appendRx, appendTx, appendInfo, clear }),
    [appendInfo, appendRx, appendTx, clear, entries],
  )
}

export type SerialLog = ReturnType<typeof useSerialLog>
