import type { SerialEntry } from './serialLog'
import { entryText } from './serialLog'

export interface PlotSeries {
  name: string
  values: (number | null)[]
}

const NAMED_VALUE = /^([^:=]+)[:=](-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)$/i
const NUMBER = /^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i

/**
 * 解析一行串口输出，兼容 Arduino 串口绘图器格式：
 * "512"、"12 34"、"12,34"、"temp:25.3 hum:60"
 */
export function parsePlotLine(text: string): Map<string, number> | null {
  const tokens = text.trim().split(/[\s,;]+/).filter(Boolean)
  const values = new Map<string, number>()
  tokens.forEach((token, index) => {
    const named = NAMED_VALUE.exec(token)
    if (named)
      values.set(named[1], Number(named[2]))
    else if (NUMBER.test(token))
      values.set(`值${index + 1}`, Number(token))
  })
  return values.size ? values : null
}

/** 取最近 maxPoints 行可解析的数据，按名称拆成多条曲线 */
export function buildPlotSeries(entries: SerialEntry[], maxPoints = 200): PlotSeries[] {
  const rows: Map<string, number>[] = []
  for (let i = entries.length - 1; i >= 0 && rows.length < maxPoints; i--) {
    const entry = entries[i]
    if (entry.dir !== 'rx' || !entry.complete)
      continue
    const row = parsePlotLine(entryText(entry))
    if (row)
      rows.push(row)
  }
  rows.reverse()

  const names: string[] = []
  for (const row of rows) {
    for (const name of row.keys()) {
      if (!names.includes(name))
        names.push(name)
    }
  }
  return names.map(name => ({ name, values: rows.map(row => row.get(name) ?? null) }))
}
