import type { TroubleshootItem } from '@mcu/shared'
import { OS_LABELS } from '@mcu/shared'
import { Flex, Tag, Typography } from 'antd'

function Section({ title, items, ordered }: { title: string, items: string[], ordered?: boolean }) {
  const ListTag = ordered ? 'ol' : 'ul'
  return (
    <div>
      <Typography.Text strong>{title}</Typography.Text>
      <ListTag style={{ margin: '4px 0 12px', paddingLeft: 20 }}>
        {items.map(item => <li key={item}>{item}</li>)}
      </ListTag>
    </div>
  )
}

export function TroubleshootHeader({ item, categoryName }: { item: TroubleshootItem, categoryName: string }) {
  return (
    <Flex gap={8} wrap align="center">
      <Tag color="volcano">{categoryName}</Tag>
      <span>{item.title}</span>
      {item.os?.map(os => <Tag key={os}>{OS_LABELS[os]}</Tag>)}
    </Flex>
  )
}

export function TroubleshootBody({ item }: { item: TroubleshootItem }) {
  return (
    <>
      <Section title="现象" items={item.symptoms} />
      <Section title="可能原因" items={item.causes} />
      <Section title="解决步骤" items={item.solutions} ordered />
    </>
  )
}
