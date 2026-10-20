import type { InputNumberProps } from 'antd'
import type { ReactNode } from 'react'
import { Card, Flex, InputNumber, Typography } from 'antd'

interface ToolCardProps {
  title: string
  description: ReactNode
  children: ReactNode
}

export function ToolCard({ title, description, children }: ToolCardProps) {
  return (
    <Card title={title} style={{ height: '100%' }}>
      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>{description}</Typography.Paragraph>
      {children}
    </Card>
  )
}

export function ResultLine({ label, value }: { label: string, value: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed var(--app-border)' }}>
      <Typography.Text type="secondary">{label}</Typography.Text>
      <Typography.Text strong>{value}</Typography.Text>
    </div>
  )
}

interface NumberFieldProps extends Omit<InputNumberProps<number>, 'onChange'> {
  label: string
  unit?: string
  onChange: (value: number | null) => void
}

/** 带标签和单位的数字输入框 */
export function NumberField({ label, unit, onChange, ...rest }: NumberFieldProps) {
  return (
    <Flex vertical gap={4} style={{ flex: '1 1 140px' }}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>{label}</Typography.Text>
      <InputNumber<number> {...rest} suffix={unit} onChange={onChange} style={{ width: '100%' }} />
    </Flex>
  )
}
