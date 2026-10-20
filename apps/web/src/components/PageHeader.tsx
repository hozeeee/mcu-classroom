import type { ReactNode } from 'react'
import { Flex, Typography } from 'antd'

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  extra?: ReactNode
}

export function PageHeader({ title, description, extra }: PageHeaderProps) {
  return (
    <Flex justify="space-between" align="flex-start" gap={16} wrap style={{ marginBottom: 20 }}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>{title}</Typography.Title>
        {description && <Typography.Paragraph type="secondary" style={{ margin: '6px 0 0' }}>{description}</Typography.Paragraph>}
      </div>
      {extra}
    </Flex>
  )
}
