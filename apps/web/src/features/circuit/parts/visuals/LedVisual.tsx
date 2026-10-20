import type { PartVisualProps } from '../types'
import { ledFill, PIN_LABEL_STYLE } from '../constants'

/** 直插 LED：长脚为阳极 A（+），短脚为阴极 K（-） */
export function LedVisual({ part, sim }: PartVisualProps) {
  const fill = ledFill(part.props?.color)
  const brightness = Math.max(0, Math.min(1, sim?.brightness ?? 0))
  return (
    <svg width={40} height={64} viewBox="0 0 40 64" overflow="visible">
      <path d="M12 38 V50 L12 64" stroke="#9e9e9e" strokeWidth={2} fill="none" />
      <path d="M28 38 V56 L28 64" stroke="#9e9e9e" strokeWidth={2} fill="none" />
      <path
        d="M6 36 V18 A14 14 0 0 1 34 18 V36 Z"
        fill={fill}
        fillOpacity={0.35 + brightness * 0.65}
        stroke="rgba(0,0,0,.35)"
        style={brightness > 0.02 ? { filter: `drop-shadow(0 0 ${4 + brightness * 10}px ${fill})` } : undefined}
      />
      <rect x={4} y={34} width={32} height={4} rx={1} fill={fill} fillOpacity={0.8} />
      <text x={6} y={58} fill="currentColor" {...PIN_LABEL_STYLE}>A</text>
      <text x={31} y={58} fill="currentColor" {...PIN_LABEL_STYLE}>K</text>
    </svg>
  )
}
