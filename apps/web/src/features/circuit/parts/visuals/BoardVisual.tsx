import type { BoardFamily } from '@mcu/shared'
import type { PartVisualProps } from '../types'
import { getBoard } from '@mcu/shared'
import { PIN_LABEL_STYLE } from '../constants'

const FAMILY_COLORS: Record<BoardFamily, string> = {
  avr: '#00878f',
  esp32: '#263238',
  stm32: '#1a3d8f',
  rp2040: '#1b7f3b',
}

/** 开发板：左右两列排针，顶部显示型号、主控与板载 LED */
export function BoardVisual({ part, definition, sim }: PartVisualProps) {
  const board = getBoard(part.type.replace(/^board:/, ''))
  const { width, height, pins } = definition
  const brightness = sim?.brightness ?? 0
  const color = board ? FAMILY_COLORS[board.family] : '#455a64'
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <rect x={1} y={1} width={width - 2} height={height - 2} rx={8} fill={color} stroke="rgba(0,0,0,.4)" />
      <rect x={width / 2 - 18} y={-2} width={36} height={14} rx={2} fill="#b0bec5" />
      <text x={width / 2} y={26} textAnchor="middle" fill="#fff" fontSize={11} fontWeight={700}>{board?.name ?? part.type}</text>
      <text x={width / 2} y={39} textAnchor="middle" fill="rgba(255,255,255,.75)" fontSize={7}>{board?.mcu}</text>
      {board?.builtinLed && (
        <g>
          <rect
            x={width - 30}
            y={8}
            width={10}
            height={6}
            rx={1}
            fill="#ffb300"
            fillOpacity={0.25 + brightness * 0.75}
            style={brightness > 0.02 ? { filter: 'drop-shadow(0 0 4px #ffb300)' } : undefined}
          />
          <text x={width - 33} y={14} textAnchor="end" fill="#fff" fontSize={7}>L</text>
        </g>
      )}
      <rect x={width / 2 - 22} y={height / 2 - 22} width={44} height={44} rx={3} fill="#212121" />
      <text x={width / 2} y={height / 2 + 3} textAnchor="middle" fill="#9e9e9e" fontSize={7}>MCU</text>
      {pins.map((pin) => {
        const left = pin.x <= 0
        return (
          <g key={pin.id}>
            <rect x={pin.x - 4} y={pin.y - 4} width={8} height={8} fill="#111" stroke="#c9a227" />
            <text
              x={left ? 8 : width - 8}
              y={pin.y + 3}
              textAnchor={left ? 'start' : 'end'}
              fill="#fff"
              {...PIN_LABEL_STYLE}
            >
              {pin.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
