import type { PartVisualProps } from '../types'
import { PIN_LABEL_STYLE } from '../constants'
import { ModuleBox } from './ModuleBox'

/** SG90 舵机：SIG 输入 50Hz PWM，脉宽 0.5~2.5ms 对应 0~180° */
export function ServoVisual({ definition, sim }: PartVisualProps) {
  const angle = sim?.angle ?? 90
  return (
    <svg width={definition.width} height={definition.height} viewBox={`0 0 ${definition.width} ${definition.height}`}>
      {definition.pins.map(pin => (
        <g key={pin.id}>
          <line x1={0} y1={pin.y} x2={20} y2={pin.y} stroke={pin.id === 'GND' ? '#5d4037' : pin.id === 'VCC' ? '#e53935' : '#fb8c00'} strokeWidth={3} />
          <text x={3} y={pin.y - 3} fill="currentColor" {...PIN_LABEL_STYLE} fontSize={6}>{pin.label}</text>
        </g>
      ))}
      <rect x={20} y={8} width={80} height={44} rx={4} fill="#1e88e5" stroke="#0d47a1" />
      <text x={44} y={46} textAnchor="middle" fill="#fff" fontSize={8}>SG90</text>
      <circle cx={76} cy={30} r={12} fill="#e3f2fd" />
      <g transform={`rotate(${angle - 90} 76 30)`}>
        <path d="M76 30 L76 4" stroke="#fafafa" strokeWidth={7} strokeLinecap="round" />
        <circle cx={76} cy={30} r={4} fill="#9e9e9e" />
      </g>
      <text x={44} y={22} textAnchor="middle" fill="#fff" fontSize={9}>{`${Math.round(angle)}°`}</text>
    </svg>
  )
}

/** 0.96 寸 I2C OLED（SSD1306），暂不支持仿真 */
export function OledVisual({ definition }: PartVisualProps) {
  const { width, height, pins } = definition
  return (
    <ModuleBox width={width} height={height} pins={pins} color="#1a237e">
      <rect x={8} y={20} width={width - 16} height={height - 28} rx={2} fill="#000" />
      <text x={width / 2} y={48} textAnchor="middle" fill="#4fc3f7" fontSize={10}>SSD1306</text>
      <text x={width / 2} y={62} textAnchor="middle" fill="#4fc3f7" fontSize={8}>128×64 I2C</text>
    </ModuleBox>
  )
}

/** ST-Link V2 下载器（SWD 接口） */
export function StlinkVisual({ definition }: PartVisualProps) {
  const { width, height, pins } = definition
  return (
    <ModuleBox width={width} height={height} pins={pins} color="#b0bec5">
      <rect x={60} y={14} width={50} height={28} rx={3} fill="#78909c" />
      <text x={85} y={32} textAnchor="middle" fill="#fff" fontSize={9} fontWeight={700}>ST-LINK</text>
    </ModuleBox>
  )
}
