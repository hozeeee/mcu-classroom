import type { PartVisualProps } from '../types'
import { ModuleBox } from './ModuleBox'

/** 光敏电阻模块：light 0~100 表示环境亮度，越暗 AO 电压越高 */
export function LdrVisual({ part, definition }: PartVisualProps) {
  const light = Number(part.props?.light ?? 50)
  return (
    <ModuleBox width={definition.width} height={definition.height} pins={definition.pins} color="#1f5fa8">
      <circle cx={22} cy={20} r={11} fill="#f5e6c8" stroke="#8d6e63" />
      <path d="M15 20 q2 -6 4 0 t4 0 t4 0" stroke="#c62828" fill="none" strokeWidth={1.5} />
      <circle cx={66} cy={20} r={8} fill="#ffca28" fillOpacity={0.15 + (light / 100) * 0.85} />
      <text x={66} y={36} textAnchor="middle" fill="#fff" fontSize={8}>{`光照 ${Math.round(light)}%`}</text>
    </ModuleBox>
  )
}

/** DHT11 温湿度传感器（单总线），暂不支持仿真 */
export function Dht11Visual({ definition }: PartVisualProps) {
  const { width, height, pins } = definition
  return (
    <ModuleBox width={width} height={height} pins={pins} color="#29b6f6">
      <rect x={8} y={6} width={width - 16} height={height - 30} rx={3} fill="#e1f5fe" />
      {Array.from({ length: 4 }, (_, row) => Array.from({ length: 4 }, (__, col) => (
        <rect key={`${row}-${col}`} x={13 + col * 10} y={11 + row * 11} width={6} height={6} fill="#4fc3f7" />
      )))}
      <text x={width / 2} y={height - 18} textAnchor="middle" fill="#01579b" fontSize={8} fontWeight={700}>DHT11</text>
    </ModuleBox>
  )
}

/** HC-SR04 超声波测距模块，暂不支持仿真 */
export function Hcsr04Visual({ definition }: PartVisualProps) {
  const { width, height, pins } = definition
  return (
    <ModuleBox width={width} height={height} pins={pins} color="#1e4f8f">
      {[30, 100].map(cx => (
        <g key={cx}>
          <circle cx={cx} cy={26} r={20} fill="#bdbdbd" stroke="#757575" strokeWidth={2} />
          <circle cx={cx} cy={26} r={13} fill="#424242" />
        </g>
      ))}
      <text x={65} y={30} textAnchor="middle" fill="#fff" fontSize={7}>HC-SR04</text>
    </ModuleBox>
  )
}
