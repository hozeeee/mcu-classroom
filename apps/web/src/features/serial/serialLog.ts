export type SerialDirection = 'rx' | 'tx' | 'info'

/** 串口记录按“行”保存：rx 数据遇到 \n 才算一行结束，未结束的行会继续拼接 */
export interface SerialEntry {
  id: number
  time: number
  dir: SerialDirection
  bytes: Uint8Array
  complete: boolean
}

export interface SerialFormatOptions {
  hex: boolean
  timestamp: boolean
}

const MAX_ENTRIES = 2000
const NEWLINE = 10

let sequence = 0
const encoder = new TextEncoder()
const decoder = new TextDecoder()

function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const merged = new Uint8Array(a.length + b.length)
  merged.set(a)
  merged.set(b, a.length)
  return merged
}

/** 追加原始字节，返回新的记录数组（不修改原数组） */
export function appendSerialBytes(entries: SerialEntry[], dir: SerialDirection, bytes: Uint8Array, now = Date.now()): SerialEntry[] {
  const next = entries.slice()
  const push = (chunk: Uint8Array, complete: boolean) => {
    const last = next.at(-1)
    if (last && last.dir === dir && !last.complete)
      next[next.length - 1] = { ...last, bytes: concatBytes(last.bytes, chunk), complete }
    else
      next.push({ id: ++sequence, time: now, dir, bytes: chunk, complete })
  }

  let start = 0
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === NEWLINE) {
      push(bytes.subarray(start, i), true)
      start = i + 1
    }
  }
  if (start < bytes.length)
    push(bytes.subarray(start), false)
  return next.length > MAX_ENTRIES ? next.slice(-MAX_ENTRIES) : next
}

/** 追加一整行文本（发送记录、系统提示） */
export function appendSerialText(entries: SerialEntry[], dir: SerialDirection, text: string, now = Date.now()): SerialEntry[] {
  const entry: SerialEntry = { id: ++sequence, time: now, dir, bytes: encoder.encode(text), complete: true }
  return [...entries, entry].slice(-MAX_ENTRIES)
}

export function entryText(entry: SerialEntry): string {
  return decoder.decode(entry.bytes).replace(/\r$/, '')
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0').toUpperCase()).join(' ')
}

function formatTime(time: number): string {
  const date = new Date(time)
  const pad = (value: number, length = 2) => String(value).padStart(length, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`
}

const DIRECTION_PREFIX: Record<SerialDirection, string> = { rx: '', tx: '→ ', info: '# ' }

export function formatEntry(entry: SerialEntry, options: SerialFormatOptions): string {
  const body = options.hex && entry.dir !== 'info' ? toHex(entry.bytes) : entryText(entry)
  const time = options.timestamp ? `[${formatTime(entry.time)}] ` : ''
  return `${time}${DIRECTION_PREFIX[entry.dir]}${body}`
}

/** 导出为纯文本（保存日志用） */
export function entriesToText(entries: SerialEntry[], options: SerialFormatOptions): string {
  return entries.map(entry => formatEntry(entry, options)).join('\n')
}
