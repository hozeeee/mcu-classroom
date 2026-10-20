import { Flex, Input, Typography } from 'antd'
import { useState } from 'react'
import { ResultLine, ToolCard } from './ToolCard'

const RADIX = { dec: 10, hex: 16, bin: 2 } as const
type Radix = keyof typeof RADIX

function parse(text: string, radix: Radix): number | null {
  const clean = text.trim().replace(/^0[xb]/i, '').replace(/[\s_]/g, '')
  if (!clean)
    return null
  const value = Number.parseInt(clean, RADIX[radix])
  return Number.isNaN(value) || value < 0 ? null : value
}

function bitExpression(value: number): string {
  const positions = value.toString(2).split('').reverse().flatMap((bit, index) => (bit === '1' ? [`(1 << ${index})`] : []))
  return positions.length ? positions.reverse().join(' | ') : '0'
}

/** 寄存器常用：十进制 / 十六进制 / 二进制互转，并按位展示 */
export function NumberBaseConverter() {
  const [value, setValue] = useState<number | null>(0b00100000)
  const [editing, setEditing] = useState<{ radix: Radix, text: string } | null>(null)

  const display = (radix: Radix) => {
    if (editing?.radix === radix)
      return editing.text
    if (value === null)
      return ''
    return radix === 'bin' ? value.toString(2).padStart(8, '0') : value.toString(RADIX[radix]).toUpperCase()
  }

  const onChange = (radix: Radix, text: string) => {
    setEditing({ radix, text })
    setValue(parse(text, radix))
  }

  const bits = value === null ? [] : value.toString(2).padStart(Math.max(8, Math.ceil(value.toString(2).length / 8) * 8), '0').split('')

  return (
    <ToolCard title="进制转换" description="操作寄存器时经常要在十进制、十六进制（0x20）和二进制（0b00100000）之间切换。">
      <Flex vertical gap={12} onBlur={() => setEditing(null)}>
        <Input prefix="DEC" value={display('dec')} onChange={e => onChange('dec', e.target.value)} />
        <Input prefix="HEX 0x" value={display('hex')} onChange={e => onChange('hex', e.target.value)} />
        <Input prefix="BIN 0b" value={display('bin')} onChange={e => onChange('bin', e.target.value)} />
        {value !== null && (
          <>
            <Flex gap={2} wrap style={{ fontFamily: 'monospace' }}>
              {bits.map((bit, index) => {
                const position = bits.length - 1 - index
                return (
                  <Flex key={position} vertical align="center" style={{ width: 26 }}>
                    <Typography.Text type="secondary" style={{ fontSize: 10 }}>{position}</Typography.Text>
                    <span style={{ width: 24, textAlign: 'center', borderRadius: 4, background: bit === '1' ? '#0f9d8a' : 'var(--app-code-bg)', color: bit === '1' ? '#fff' : undefined }}>
                      {bit}
                    </span>
                  </Flex>
                )
              })}
            </Flex>
            <ResultLine label="按位写法" value={bitExpression(value)} />
          </>
        )}
      </Flex>
    </ToolCard>
  )
}
