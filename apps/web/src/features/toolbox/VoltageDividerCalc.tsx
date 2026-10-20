import { Flex, Segmented } from 'antd'
import { useState } from 'react'
import { formatSi } from './calc'
import { NumberField, ResultLine, ToolCard } from './ToolCard'

type AdcBits = 10 | 12

/** 分压电路 + ADC 读数换算 */
export function VoltageDividerCalc() {
  const [vin, setVin] = useState(5)
  const [r1, setR1] = useState(10000)
  const [r2, setR2] = useState(10000)
  const [vref, setVref] = useState(5)
  const [bits, setBits] = useState<AdcBits>(10)

  const vout = r1 + r2 > 0 ? (vin * r2) / (r1 + r2) : 0
  const max = 2 ** bits - 1
  const reading = Math.min(max, Math.round((vout / vref) * max))
  const current = r1 + r2 > 0 ? vin / (r1 + r2) : 0

  return (
    <ToolCard
      title="分压电路 / ADC 换算"
      description="Vout = Vin × R2 / (R1 + R2)。常用于把高电压降到单片机可测范围，或读取电位器、光敏电阻。"
    >
      <Flex vertical gap={12}>
        <Flex gap={12} wrap>
          <NumberField label="输入电压 Vin" unit="V" min={0} step={0.1} value={vin} onChange={v => setVin(v ?? 0)} />
          <NumberField label="上臂 R1" unit="Ω" min={0} value={r1} onChange={v => setR1(v ?? 0)} />
          <NumberField label="下臂 R2" unit="Ω" min={0} value={r2} onChange={v => setR2(v ?? 0)} />
        </Flex>
        <Flex gap={12} wrap align="flex-end">
          <NumberField label="ADC 参考电压" unit="V" min={0.1} step={0.1} value={vref} onChange={v => setVref(v ?? 5)} />
          <Segmented<AdcBits>
            value={bits}
            onChange={setBits}
            options={[{ value: 10, label: '10 位 (Uno)' }, { value: 12, label: '12 位 (ESP32/STM32)' }]}
          />
        </Flex>
        <div>
          <ResultLine label="输出电压 Vout" value={formatSi(vout, 'V')} />
          <ResultLine label={`analogRead() 读数 (0~${max})`} value={reading} />
          <ResultLine label="分压电路电流" value={formatSi(current, 'A')} />
          {vout > vref && <ResultLine label="⚠️ 警告" value="Vout 超过参考电压，可能损坏引脚" />}
        </div>
      </Flex>
    </ToolCard>
  )
}
