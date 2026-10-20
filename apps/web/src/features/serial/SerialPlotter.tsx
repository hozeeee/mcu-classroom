import type { SerialEntry } from './serialLog'
import { useMemo } from 'react'
import { buildPlotSeries } from './plotData'

const WIDTH = 600
const HEIGHT = 240
const COLORS = ['#58a6ff', '#f78166', '#7ee787', '#d2a8ff', '#ffa657', '#79c0ff', '#ff7b72', '#e3b341']

function toPolyline(values: (number | null)[], total: number, min: number, range: number): string {
  const step = total > 1 ? WIDTH / (total - 1) : 0
  return values
    .map((value, index) => (value === null ? null : `${(index * step).toFixed(1)},${(HEIGHT - ((value - min) / range) * HEIGHT).toFixed(1)}`))
    .filter(Boolean)
    .join(' ')
}

/** 串口绘图器：把串口打印的数字画成实时曲线（类似 Arduino IDE 的 Serial Plotter） */
export function SerialPlotter({ entries }: { entries: SerialEntry[] }) {
  const series = useMemo(() => buildPlotSeries(entries), [entries])
  const numbers = series.flatMap(item => item.values.filter((value): value is number => value !== null))

  if (!numbers.length) {
    return (
      <div className="serial-plotter">
        <div className="serial-plotter-empty">
          还没有可绘制的数据
          <br />
          在程序里用 Serial.println(value) 或 Serial.println("temp:25 hum:60") 输出数字即可
        </div>
      </div>
    )
  }

  let min = Math.min(...numbers)
  let max = Math.max(...numbers)
  if (min === max) {
    min -= 1
    max += 1
  }
  const range = max - min
  const total = series[0].values.length

  return (
    <div className="serial-plotter">
      <div className="serial-plotter-legend">
        {series.map((item, index) => (
          <span key={item.name}>
            <i style={{ background: COLORS[index % COLORS.length] }} />
            {item.name}
            ：
            {item.values.at(-1) ?? '-'}
          </span>
        ))}
        <span style={{ marginLeft: 'auto', color: '#8b949e' }}>{`范围 ${min} ~ ${max}`}</span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
        {[0.25, 0.5, 0.75].map(ratio => (
          <line key={ratio} x1={0} x2={WIDTH} y1={HEIGHT * ratio} y2={HEIGHT * ratio} stroke="#30363d" vectorEffect="non-scaling-stroke" />
        ))}
        {series.map((item, index) => (
          <polyline
            key={item.name}
            points={toPolyline(item.values, total, min, range)}
            fill="none"
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
    </div>
  )
}
