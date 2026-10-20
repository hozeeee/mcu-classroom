import type { ESeries } from './calc'
import { Alert, Flex, Segmented, Select } from 'antd'
import { useState } from 'react'
import { formatSi, nextStandardResistor } from './calc'
import { NumberField, ResultLine, ToolCard } from './ToolCard'

/** 常见 LED 正向压降（典型值） */
const LED_PRESETS = [
  { label: '红色', vf: 2.0 },
  { label: '黄色', vf: 2.1 },
  { label: '绿色（普通）', vf: 2.2 },
  { label: '绿色（高亮）', vf: 3.0 },
  { label: '蓝色', vf: 3.0 },
  { label: '白色', vf: 3.1 },
]

export function LedResistorCalc() {
  const [supply, setSupply] = useState(5)
  const [vf, setVf] = useState(2.0)
  const [currentMa, setCurrentMa] = useState(10)
  const [series, setSeries] = useState<ESeries>('E24')

  const ideal = (supply - vf) / (currentMa / 1000)
  const standard = nextStandardResistor(ideal, series)
  const actualCurrent = standard > 0 ? (supply - vf) / standard : 0
  const power = actualCurrent * actualCurrent * standard
  const invalid = supply <= vf || currentMa <= 0

  return (
    <ToolCard title="LED 限流电阻" description="LED 必须串联电阻限制电流。单片机 IO 口一般建议每路不超过 10~20 mA。">
      <Flex vertical gap={12}>
        <Flex gap={12} wrap>
          <NumberField label="供电电压" unit="V" min={0} step={0.1} value={supply} onChange={v => setSupply(v ?? 0)} />
          <Flex vertical gap={4} style={{ flex: '1 1 140px' }}>
            <span className="muted" style={{ fontSize: 12 }}>LED 颜色</span>
            <Select
              value={vf}
              onChange={setVf}
              options={LED_PRESETS.map(item => ({ value: item.vf, label: `${item.label} ≈ ${item.vf}V` }))}
            />
          </Flex>
          <NumberField label="正向压降 Vf" unit="V" min={0} step={0.1} value={vf} onChange={v => setVf(v ?? 0)} />
          <NumberField label="目标电流" unit="mA" min={1} max={30} value={currentMa} onChange={v => setCurrentMa(v ?? 0)} />
        </Flex>
        <Segmented<ESeries> value={series} onChange={setSeries} options={['E12', 'E24']} style={{ alignSelf: 'flex-start' }} />
        {invalid
          ? <Alert type="warning" showIcon title="供电电压必须大于 LED 压降，电流必须大于 0" />
          : (
              <div>
                <ResultLine label="理论阻值" value={formatSi(ideal, 'Ω')} />
                <ResultLine label={`推荐标准阻值（${series}）`} value={formatSi(standard, 'Ω')} />
                <ResultLine label="实际电流" value={formatSi(actualCurrent, 'A')} />
                <ResultLine label="电阻功耗" value={`${formatSi(power, 'W')}${power > 0.125 ? '（超过 1/8W，请选更大功率电阻）' : ''}`} />
              </div>
            )}
      </Flex>
    </ToolCard>
  )
}
