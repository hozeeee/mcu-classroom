import type { Material } from '@mcu/shared'
import { Card, Flex, Tag, Typography } from 'antd'

export function MaterialCard({ material, onClick }: { material: Material, onClick: () => void }) {
  return (
    <Card hoverable size="small" onClick={onClick} style={{ height: '100%' }}>
      <Flex gap={12}>
        <div style={{ fontSize: 36, lineHeight: 1 }}>{material.icon}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Flex justify="space-between" gap={8}>
            <Typography.Text strong ellipsis>{material.name}</Typography.Text>
            {material.essential && <Tag color="gold" style={{ marginInlineEnd: 0 }}>必备</Tag>}
          </Flex>
          <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: '6px 0', fontSize: 13 }}>
            {material.summary}
          </Typography.Paragraph>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>{`参考价：${material.price}`}</Typography.Text>
        </div>
      </Flex>
    </Card>
  )
}
