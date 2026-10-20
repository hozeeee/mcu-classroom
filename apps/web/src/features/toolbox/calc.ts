/** 工具箱用到的纯计算函数，与 UI 分离便于复用 */

const E12 = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2]
const E24 = [1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1]

export type ESeries = 'E12' | 'E24'

/** 找到不小于目标值的最接近标准电阻（限流电阻宁大勿小） */
export function nextStandardResistor(ohms: number, series: ESeries = 'E24'): number {
  if (!Number.isFinite(ohms) || ohms <= 0)
    return 0
  const table = series === 'E12' ? E12 : E24
  let decade = 10 ** Math.floor(Math.log10(ohms))
  for (let i = 0; i < 2; i++) {
    for (const base of table) {
      const value = Number((base * decade).toPrecision(3))
      if (value >= ohms * 0.999)
        return value
    }
    decade *= 10
  }
  return ohms
}

const SI_PREFIXES: [number, string][] = [[1e9, 'G'], [1e6, 'M'], [1e3, 'k'], [1, ''], [1e-3, 'm'], [1e-6, 'μ'], [1e-9, 'n'], [1e-12, 'p']]

/** 1500 → 1.5 k，0.02 → 20 m */
export function formatSi(value: number, unit: string, digits = 3): string {
  if (!Number.isFinite(value))
    return '-'
  if (value === 0)
    return `0 ${unit}`
  const abs = Math.abs(value)
  const [factor, prefix] = SI_PREFIXES.find(([f]) => abs >= f) ?? SI_PREFIXES.at(-1)!
  return `${Number((value / factor).toPrecision(digits))} ${prefix}${unit}`
}

export interface OhmsInput {
  voltage?: number
  current?: number
  resistance?: number
}

export interface OhmsResult {
  voltage: number
  current: number
  resistance: number
  power: number
}

/** 已知 V / I / R 中任意两个，求其余量和功率 */
export function solveOhms({ voltage: v, current: i, resistance: r }: OhmsInput): OhmsResult | null {
  if (v !== undefined && i !== undefined && i !== 0)
    return { voltage: v, current: i, resistance: v / i, power: v * i }
  if (v !== undefined && r !== undefined && r !== 0)
    return { voltage: v, current: v / r, resistance: r, power: (v * v) / r }
  if (i !== undefined && r !== undefined)
    return { voltage: i * r, current: i, resistance: r, power: i * i * r }
  return null
}

export interface ColorBand {
  name: string
  color: string
  digit?: number
  multiplier?: number
  tolerance?: string
}

export const COLOR_BANDS: ColorBand[] = [
  { name: '黑', color: '#000000', digit: 0, multiplier: 1 },
  { name: '棕', color: '#8b4513', digit: 1, multiplier: 10, tolerance: '±1%' },
  { name: '红', color: '#e53935', digit: 2, multiplier: 100, tolerance: '±2%' },
  { name: '橙', color: '#fb8c00', digit: 3, multiplier: 1e3 },
  { name: '黄', color: '#fdd835', digit: 4, multiplier: 1e4 },
  { name: '绿', color: '#43a047', digit: 5, multiplier: 1e5, tolerance: '±0.5%' },
  { name: '蓝', color: '#1e88e5', digit: 6, multiplier: 1e6, tolerance: '±0.25%' },
  { name: '紫', color: '#8e24aa', digit: 7, multiplier: 1e7, tolerance: '±0.1%' },
  { name: '灰', color: '#9e9e9e', digit: 8, multiplier: 1e8, tolerance: '±0.05%' },
  { name: '白', color: '#ffffff', digit: 9, multiplier: 1e9 },
  { name: '金', color: '#d4af37', multiplier: 0.1, tolerance: '±5%' },
  { name: '银', color: '#c0c0c0', multiplier: 0.01, tolerance: '±10%' },
]

/** 根据色环计算阻值：digits 为前 3/4 环（数字环），倍率环和误差环单独传入 */
export function colorCodeValue(digits: number[], multiplier: number): number {
  const base = digits.reduce((sum, digit) => sum * 10 + digit, 0)
  return Number((base * multiplier).toPrecision(6))
}

/** 反查色环：返回数字环的 digit 列表和倍率（10 的幂） */
export function valueToColorCode(ohms: number, digitCount: 2 | 3): { digits: number[], exponent: number } | null {
  if (!Number.isFinite(ohms) || ohms <= 0)
    return null
  const exponent = Math.floor(Math.log10(ohms)) - (digitCount - 1)
  const significant = Math.round(ohms / 10 ** exponent)
  const digits = String(significant).padStart(digitCount, '0').slice(0, digitCount).split('').map(Number)
  if (exponent < -2 || exponent > 9)
    return null
  return { digits, exponent }
}

/** 瓷片电容三位数标识：104 → 100000 pF = 100 nF */
export function capacitorCodeToPf(code: string): number | null {
  if (!/^\d{3}$/.test(code))
    return null
  return Number(code.slice(0, 2)) * 10 ** Number(code[2])
}
