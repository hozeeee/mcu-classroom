import type { PartDefinition } from './types'
import { LED_COLORS } from './constants'
import { ButtonVisual } from './visuals/ButtonVisual'
import { BuzzerVisual } from './visuals/BuzzerVisual'
import { LedVisual } from './visuals/LedVisual'
import { PotentiometerVisual } from './visuals/PotentiometerVisual'
import { ResistorVisual } from './visuals/ResistorVisual'

export const BASIC_PARTS: PartDefinition[] = [
  {
    type: 'led',
    name: 'LED 发光二极管',
    category: 'output',
    description: '长脚阳极 A 接高电位，短脚阴极 K 接 GND，必须串联限流电阻。',
    width: 40,
    height: 64,
    pins: [{ id: 'A', label: 'A+', x: 12, y: 64 }, { id: 'C', label: 'K-', x: 28, y: 64 }],
    defaultProps: { color: 'red' },
    fields: [{ key: 'color', label: '颜色', type: 'select', options: LED_COLORS.map(({ value, label }) => ({ value, label })) }],
    simulatable: true,
    Visual: LedVisual,
  },
  {
    type: 'resistor',
    name: '电阻',
    category: 'basic',
    description: '限流、分压、上拉/下拉。无极性，两脚可互换。',
    width: 90,
    height: 30,
    pins: [{ id: '1', label: '1', x: 0, y: 12 }, { id: '2', label: '2', x: 90, y: 12 }],
    defaultProps: { ohms: 220 },
    fields: [{ key: 'ohms', label: '阻值', type: 'number', min: 1, max: 10_000_000, unit: 'Ω' }],
    simulatable: true,
    Visual: ResistorVisual,
  },
  {
    type: 'button',
    name: '轻触按键',
    category: 'input',
    description: '按下时两脚导通。常配合 INPUT_PULLUP 一端接引脚、一端接 GND。',
    width: 56,
    height: 56,
    pins: [{ id: '1', label: '1', x: 0, y: 28 }, { id: '2', label: '2', x: 56, y: 28 }],
    simulatable: true,
    Visual: ButtonVisual,
  },
  {
    type: 'potentiometer',
    name: '电位器',
    category: 'input',
    description: '可调分压器：两端接 VCC/GND，中间脚输出 0~VCC 的电压，接到模拟引脚。',
    width: 80,
    height: 72,
    pins: [
      { id: 'VCC', label: 'VCC', x: 16, y: 72 },
      { id: 'SIG', label: 'SIG', x: 40, y: 72 },
      { id: 'GND', label: 'GND', x: 64, y: 72 },
    ],
    defaultProps: { value: 50 },
    fields: [{ key: 'value', label: '旋钮位置', type: 'slider', min: 0, max: 100, unit: '%' }],
    simulatable: true,
    Visual: PotentiometerVisual,
  },
  {
    type: 'buzzer',
    name: '无源蜂鸣器',
    category: 'output',
    description: '需要输入方波才能发声，用 tone() 控制音调。P 接信号，N 接 GND。',
    width: 60,
    height: 64,
    pins: [{ id: 'P', label: 'P', x: 22, y: 64 }, { id: 'N', label: 'N', x: 38, y: 64 }],
    simulatable: true,
    Visual: BuzzerVisual,
  },
]
