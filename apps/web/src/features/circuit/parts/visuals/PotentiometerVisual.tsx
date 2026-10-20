import type { PartVisualProps } from '../types'
import { PIN_LABEL_STYLE } from '../constants'

/** 旋转电位器：value 0~100 表示旋钮位置 */
export function PotentiometerVisual({ part }: PartVisualProps) {
  const value = Number(part.props?.value ?? 50)
  const angle = -135 + (270 * value) / 100
  return (
    <svg width={80} height={72} viewBox="0 0 80 72">
      {[16, 40, 64].map(x => <line key={x} x1={x} y1={50} x2={x} y2={72} stroke="#9e9e9e" strokeWidth={2} />)}
      <rect x={8} y={6} width={64} height={48} rx={6} fill="#1565c0" />
      <circle cx={40} cy={30} r={18} fill="#e0e0e0" stroke="#9e9e9e" />
      <line x1={40} y1={30} x2={40} y2={15} stroke="#424242" strokeWidth={3} strokeLinecap="round" transform={`rotate(${angle} 40 30)`} />
      <text x={40} y={52} textAnchor="middle" fill="#fff" fontSize={8}>{`${Math.round(value)}%`}</text>
      <text x={16} y={66} textAnchor="middle" fill="currentColor" {...PIN_LABEL_STYLE} fontSize={6}>VCC</text>
      <text x={40} y={66} textAnchor="middle" fill="currentColor" {...PIN_LABEL_STYLE} fontSize={6}>SIG</text>
      <text x={64} y={66} textAnchor="middle" fill="currentColor" {...PIN_LABEL_STYLE} fontSize={6}>GND</text>
    </svg>
  )
}
