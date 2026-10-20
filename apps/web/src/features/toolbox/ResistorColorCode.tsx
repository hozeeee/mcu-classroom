import type { ColorBand } from './calc'
import { Flex, InputNumber, Segmented, Select, Typography } from 'antd'
import { useState } from 'react'
import { COLOR_BANDS, colorCodeValue, formatSi, valueToColorCode } from './calc'
import { ResultLine, ToolCard } from './ToolCard'

type BandCount = 4 | 5

const DIGIT_BANDS = COLOR_BANDS.filter(band => band.digit !== undefined)
const MULTIPLIER_BANDS = COLOR_BANDS.filter(band => band.multiplier !== undefined)
const TOLERANCE_BANDS = COLOR_BANDS.filter(band => band.tolerance !== undefined)

function Swatch({ band }: { band: ColorBand }) {
  return (
    <Flex align="center" gap={6}>
      <span style={{ width: 14, height: 14, borderRadius: 3, background: band.color, border: '1px solid #999', display: 'inline-block' }} />
      {band.name}
    </Flex>
  )
}

function bandOptions(bands: ColorBand[]) {
  return bands.map(band => ({ value: band.name, label: <Swatch band={band} /> }))
}

const findBand = (name: string) => COLOR_BANDS.find(band => band.name === name)!

/** 电阻示意图 */
function ResistorPreview({ bands }: { bands: ColorBand[] }) {
  return (
    <svg viewBox="0 0 220 50" width="100%" height={60}>
      <line x1="0" y1="25" x2="220" y2="25" stroke="#999" strokeWidth="4" />
      <rect x="40" y="8" width="140" height="34" rx="12" fill="#e8d3a8" stroke="#b89b6a" />
      {bands.map((band, index) => {
        const isLast = index === bands.length - 1
        const x = isLast ? 158 : 58 + index * 20
        // eslint-disable-next-line react/no-array-index-key -- 色环按位置排列，位置即标识
        return <rect key={index} x={x} y="8" width="9" height="34" fill={band.color} stroke="#0003" />
      })}
    </svg>
  )
}

export function ResistorColorCode() {
  const [count, setCount] = useState<BandCount>(4)
  const [digits, setDigits] = useState(['棕', '黑', '黑'])
  const [multiplier, setMultiplier] = useState('红')
  const [tolerance, setTolerance] = useState('金')
  const [lookup, setLookup] = useState<number | null>(220)

  const digitCount = count === 4 ? 2 : 3
  const activeDigits = digits.slice(0, digitCount).map(findBand)
  const ohms = colorCodeValue(activeDigits.map(band => band.digit!), findBand(multiplier).multiplier!)
  const bands = [...activeDigits, findBand(multiplier), findBand(tolerance)]

  const reverse = lookup ? valueToColorCode(lookup, digitCount) : null
  const reverseBands = reverse
    ? [...reverse.digits.map(digit => DIGIT_BANDS.find(band => band.digit === digit)!), MULTIPLIER_BANDS.find(band => band.multiplier === 10 ** reverse.exponent)].filter(Boolean) as ColorBand[]
    : []

  return (
    <ToolCard title="电阻色环" description="从左往右读：前 2（或 3）环是数字，接着是倍率环，最后（间距稍大）的是误差环，常见为金色 ±5% 或棕色 ±1%。">
      <Flex vertical gap={12}>
        <Segmented<BandCount> value={count} onChange={setCount} options={[{ value: 4, label: '四色环' }, { value: 5, label: '五色环' }]} style={{ alignSelf: 'flex-start' }} />
        <ResistorPreview bands={bands} />
        <Flex gap={8} wrap>
          {Array.from({ length: digitCount }, (_, index) => (
            <Select
              key={index}
              style={{ width: 100 }}
              value={digits[index]}
              onChange={value => setDigits(old => old.map((item, i) => (i === index ? value : item)))}
              options={bandOptions(DIGIT_BANDS)}
            />
          ))}
          <Select style={{ width: 100 }} value={multiplier} onChange={setMultiplier} options={bandOptions(MULTIPLIER_BANDS)} />
          <Select style={{ width: 100 }} value={tolerance} onChange={setTolerance} options={bandOptions(TOLERANCE_BANDS)} />
        </Flex>
        <ResultLine label="阻值" value={`${formatSi(ohms, 'Ω')} ${findBand(tolerance).tolerance ?? ''}`} />
        <Typography.Text strong>反查：我要买多大的电阻？</Typography.Text>
        <Flex gap={12} align="center" wrap>
          <InputNumber<number> min={0.1} value={lookup} onChange={setLookup} suffix="Ω" style={{ width: 160 }} />
          {reverseBands.length > 0
            ? (
                <Flex gap={8}>
                  {reverseBands.map((band, index) => (
                    // eslint-disable-next-line react/no-array-index-key -- 色环按位置排列，位置即标识
                    <Swatch key={index} band={band} />
                  ))}
                </Flex>
              )
            : <span className="muted">无法表示</span>}
        </Flex>
      </Flex>
    </ToolCard>
  )
}
