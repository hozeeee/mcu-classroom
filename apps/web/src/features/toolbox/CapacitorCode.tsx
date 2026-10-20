import { Flex, Input, Typography } from 'antd'
import { useState } from 'react'
import { capacitorCodeToPf, formatSi } from './calc'
import { ResultLine, ToolCard } from './ToolCard'

const COMMON = ['102', '103', '104', '105', '220', '221', '222', '473']

export function CapacitorCode() {
  const [code, setCode] = useState('104')
  const pf = capacitorCodeToPf(code.trim())

  return (
    <ToolCard title="瓷片电容读数" description="三位数字：前两位是有效数字，第三位是 10 的几次方，单位 pF。例如 104 = 10 × 10⁴ pF = 100 nF = 0.1 μF。">
      <Flex vertical gap={12}>
        <Input value={code} onChange={e => setCode(e.target.value)} maxLength={3} placeholder="例如 104" style={{ width: 160 }} />
        {pf === null
          ? <span className="muted">请输入三位数字</span>
          : (
              <div>
                <ResultLine label="容值" value={formatSi(pf * 1e-12, 'F')} />
                <ResultLine label="皮法" value={`${pf.toLocaleString()} pF`} />
              </div>
            )}
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          常见：
          {COMMON.map(item => (
            <Typography.Link key={item} onClick={() => setCode(item)} style={{ marginInlineStart: 8 }}>{item}</Typography.Link>
          ))}
        </Typography.Text>
      </Flex>
    </ToolCard>
  )
}
