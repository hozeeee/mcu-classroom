import type { PartVisualProps } from '../types'
import { COLOR_BANDS, formatSi, valueToColorCode } from '../../../toolbox/calc'

function bandColors(ohms: number): string[] {
  const code = valueToColorCode(ohms, 2)
  if (!code)
    return []
  const multiplier = COLOR_BANDS.find(band => band.multiplier === 10 ** code.exponent)
  const digits = code.digits.map(digit => COLOR_BANDS.find(band => band.digit === digit)?.color ?? '#000')
  return [...digits, multiplier?.color ?? '#000', '#d4af37']
}

/** 色环电阻（四环），无极性 */
export function ResistorVisual({ part }: PartVisualProps) {
  const ohms = Number(part.props?.ohms ?? 220)
  const bands = bandColors(ohms)
  return (
    <svg width={90} height={30} viewBox="0 0 90 30">
      <line x1={0} y1={12} x2={90} y2={12} stroke="#9e9e9e" strokeWidth={2} />
      <rect x={22} y={4} width={46} height={16} rx={6} fill="#e8c99b" stroke="#b38b59" />
      {bands.map((color, index) => (
        // eslint-disable-next-line react/no-array-index-key
        <rect key={index} x={index === 3 ? 58 : 28 + index * 7} y={4} width={4} height={16} fill={color} />
      ))}
      <text x={45} y={29} textAnchor="middle" fill="currentColor" fontSize={8}>{formatSi(ohms, 'Ω')}</text>
    </svg>
  )
}
