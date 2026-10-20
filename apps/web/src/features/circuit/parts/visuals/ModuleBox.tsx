import type { ReactNode } from 'react'
import type { PinDef } from '../types'
import { PIN_LABEL_STYLE } from '../constants'

interface ModuleBoxProps {
  width: number
  height: number
  pins: PinDef[]
  color?: string
  title?: string
  children?: ReactNode
}

/** 引脚标签放在引脚内侧，避免被导线遮挡 */
function labelProps(pin: PinDef, width: number, height: number) {
  if (pin.y >= height)
    return { x: pin.x, y: pin.y - 6, textAnchor: 'middle' as const }
  if (pin.y <= 0)
    return { x: pin.x, y: pin.y + 12, textAnchor: 'middle' as const }
  if (pin.x <= 0)
    return { x: pin.x + 6, y: pin.y + 3, textAnchor: 'start' as const }
  if (pin.x >= width)
    return { x: pin.x - 6, y: pin.y + 3, textAnchor: 'end' as const }
  return { x: pin.x, y: pin.y + 12, textAnchor: 'middle' as const }
}

/** 通用的传感器 / 模块外观：一块 PCB + 排针 + 引脚名 */
export function ModuleBox({ width, height, pins, color = '#1f5fa8', title, children }: ModuleBoxProps) {
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <rect x={1} y={1} width={width - 2} height={height - 2} rx={4} fill={color} stroke="#0b2d52" strokeWidth={1} />
      {children}
      {title && (
        <text x={width / 2} y={height / 2 + 4} textAnchor="middle" fill="#fff" fontSize={10} fontWeight={600}>{title}</text>
      )}
      {pins.map(pin => (
        <g key={pin.id}>
          <rect x={pin.x - 3} y={pin.y - 3} width={6} height={6} fill="#c9a227" />
          <text {...labelProps(pin, width, height)} fill="#fff" {...PIN_LABEL_STYLE}>{pin.label}</text>
        </g>
      ))}
    </svg>
  )
}
