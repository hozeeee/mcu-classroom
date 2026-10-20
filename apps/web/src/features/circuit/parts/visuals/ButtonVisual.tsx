import type { PartVisualProps } from '../types'
import { useCircuitInteraction } from '../../simContext'

/** 轻触按键：按下时 1、2 两脚导通。仿真运行中可用鼠标按住 */
export function ButtonVisual({ part, sim }: PartVisualProps) {
  const { running, pressButton } = useCircuitInteraction()
  const pressed = Boolean(sim?.pressed)
  const release = () => pressed && pressButton(part.id, false)
  return (
    <svg width={56} height={56} viewBox="0 0 56 56">
      <line x1={0} y1={28} x2={10} y2={28} stroke="#9e9e9e" strokeWidth={2} />
      <line x1={46} y1={28} x2={56} y2={28} stroke="#9e9e9e" strokeWidth={2} />
      <rect x={8} y={8} width={40} height={40} rx={4} fill="#3a3a3a" stroke="#1d1d1d" />
      <circle
        className={running ? 'nodrag nopan' : undefined}
        cx={28}
        cy={28}
        r={pressed ? 11 : 13}
        fill={pressed ? '#c62828' : '#ef5350'}
        stroke="#7f1d1d"
        style={{ cursor: running ? 'pointer' : undefined }}
        onPointerDown={running ? () => pressButton(part.id, true) : undefined}
        onPointerUp={running ? release : undefined}
        onPointerLeave={running ? release : undefined}
      />
      {running && <text x={28} y={54} textAnchor="middle" fontSize={7} fill="#fff">按住</text>}
    </svg>
  )
}
