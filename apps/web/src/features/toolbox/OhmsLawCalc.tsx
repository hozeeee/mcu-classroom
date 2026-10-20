import type { OhmsInput } from './calc'
import { Button, Flex } from 'antd'
import { useState } from 'react'
import { formatSi, solveOhms } from './calc'
import { NumberField, ResultLine, ToolCard } from './ToolCard'

type Field = keyof OhmsInput

/** 欧姆定律：以最近填写的两个量为准，求第三个 */
export function OhmsLawCalc() {
  const [values, setValues] = useState<OhmsInput>({ voltage: 5, resistance: 220 })
  const [recent, setRecent] = useState<Field[]>(['voltage', 'resistance'])

  const known: OhmsInput = Object.fromEntries(recent.map(field => [field, values[field]]))
  const result = solveOhms(known)

  const set = (field: Field, value: number | null) => {
    setValues(old => ({ ...old, [field]: value ?? undefined }))
    setRecent(old => value === null ? old.filter(f => f !== field) : [field, ...old.filter(f => f !== field)].slice(0, 2))
  }

  return (
    <ToolCard title="欧姆定律 V = I × R" description="填写电压、电流、电阻中的任意两个（以最近修改的两项为准），自动求出第三个和功率。">
      <Flex vertical gap={12}>
        <Flex gap={12} wrap>
          <NumberField label="电压" unit="V" min={0} value={values.voltage} onChange={v => set('voltage', v)} />
          <NumberField
            label="电流"
            unit="mA"
            min={0}
            value={values.current === undefined ? undefined : Number((values.current * 1000).toPrecision(6))}
            onChange={v => set('current', v === null ? null : v / 1000)}
          />
          <NumberField label="电阻" unit="Ω" min={0} value={values.resistance} onChange={v => set('resistance', v)} />
        </Flex>
        {result
          ? (
              <div>
                <ResultLine label="电压" value={formatSi(result.voltage, 'V')} />
                <ResultLine label="电流" value={formatSi(result.current, 'A')} />
                <ResultLine label="电阻" value={formatSi(result.resistance, 'Ω')} />
                <ResultLine label="功率" value={formatSi(result.power, 'W')} />
              </div>
            )
          : <span className="muted">至少填写两个值</span>}
        <Button
          size="small"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => {
            setValues({})
            setRecent([])
          }}
        >
          清空
        </Button>
      </Flex>
    </ToolCard>
  )
}
