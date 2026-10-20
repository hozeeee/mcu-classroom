import type { PartVisualProps } from '../types'

/** 无源蜂鸣器：引脚输出方波时发声，仿真中显示当前频率 */
export function BuzzerVisual({ sim }: PartVisualProps) {
  const frequency = sim?.frequency ?? 0
  const sounding = frequency > 0
  return (
    <svg width={60} height={64} viewBox="0 0 60 64" overflow="visible">
      <line x1={22} y1={48} x2={22} y2={64} stroke="#9e9e9e" strokeWidth={2} />
      <line x1={38} y1={48} x2={38} y2={64} stroke="#9e9e9e" strokeWidth={2} />
      <circle cx={30} cy={28} r={24} fill="#212121" stroke="#000" />
      <circle cx={30} cy={28} r={4} fill="#555" />
      <text x={14} y={20} fill="#fff" fontSize={10}>+</text>
      {sounding && (
        <g stroke="#fb8c00" strokeWidth={2} fill="none">
          <path d="M58 16 Q64 28 58 40" />
          <path d="M64 10 Q74 28 64 46" />
          <text x={30} y={-4} textAnchor="middle" fill="#fb8c00" stroke="none" fontSize={9}>{`${Math.round(frequency)} Hz`}</text>
        </g>
      )}
      <text x={18} y={60} fill="currentColor" fontSize={7}>P</text>
      <text x={41} y={60} fill="currentColor" fontSize={7}>N</text>
    </svg>
  )
}
