/** LED 颜色：value 为属性值，fill 为绘制颜色 */
export const LED_COLORS = [
  { value: 'red', label: '红色', fill: '#ff3b30' },
  { value: 'green', label: '绿色', fill: '#34c759' },
  { value: 'yellow', label: '黄色', fill: '#ffcc00' },
  { value: 'blue', label: '蓝色', fill: '#2f7bff' },
  { value: 'white', label: '白色', fill: '#f2f2f2' },
] as const

export function ledFill(color: unknown): string {
  return LED_COLORS.find(item => item.value === color)?.fill ?? LED_COLORS[0].fill
}

export const PIN_LABEL_STYLE = {
  fontSize: 8,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
} as const

/** 导线可选颜色（红=电源，黑=地，其他=信号） */
export const WIRE_COLORS = ['#e53935', '#212121', '#fb8c00', '#1e88e5', '#43a047', '#8e24aa', '#fdd835', '#9e9e9e']

export const DEFAULT_WIRE_COLOR = '#fb8c00'

/** 从元件库拖拽到画布时使用的 dataTransfer 类型 */
export const PART_DRAG_TYPE = 'application/x-mcu-part'
