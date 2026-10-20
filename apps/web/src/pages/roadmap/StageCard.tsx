import type { RoadmapItem, RoadmapStage } from '@mcu/shared'
import type { ReactNode } from 'react'
import { BookOutlined, BuildOutlined, CheckCircleFilled, ClockCircleOutlined, ToolOutlined } from '@ant-design/icons'
import { Card, Flex, List, Progress, Tag, Typography } from 'antd'
import { useNavigate } from 'react-router'
import { useArticleIndex } from '../../queries/content'
import { useProgressMap } from '../../queries/progress'
import { computeRoadmapStats, progressKey, roadmapItemPath } from '../../utils/roadmap'

const TYPE_META: Record<RoadmapItem['type'], { label: string, icon: ReactNode, color: string }> = {
  article: { label: '阅读', icon: <BookOutlined />, color: 'blue' },
  project: { label: '实战', icon: <BuildOutlined />, color: 'purple' },
  tool: { label: '工具', icon: <ToolOutlined />, color: 'cyan' },
  page: { label: '实操', icon: <ToolOutlined />, color: 'cyan' },
}

function ItemStatus({ item }: { item: RoadmapItem }) {
  const progress = useProgressMap()
  const key = progressKey(item)
  const status = key ? progress.get(key) : undefined
  if (status === 'done')
    return <CheckCircleFilled style={{ color: '#52c41a' }} />
  if (status === 'doing')
    return <ClockCircleOutlined style={{ color: '#1677ff' }} />
  return <span style={{ display: 'inline-block', width: 14 }} />
}

export function StageCard({ stage, index }: { stage: RoadmapStage, index: number }) {
  const navigate = useNavigate()
  const articles = useArticleIndex()
  const progress = useProgressMap()
  const stats = computeRoadmapStats([stage], progress)

  return (
    <Card
      id={stage.id}
      title={(
        <Flex align="center" gap={12}>
          <span>{stage.title}</span>
          <Typography.Text type="secondary" style={{ fontWeight: 'normal' }}>{stage.subtitle}</Typography.Text>
        </Flex>
      )}
      extra={<Tag>{stage.weeks}</Tag>}
      style={{ marginBottom: 16 }}
    >
      <Flex gap={24} wrap>
        <div style={{ flex: '1 1 280px' }}>
          <Typography.Paragraph>
            <Typography.Text strong>阶段目标：</Typography.Text>
            {stage.goal}
          </Typography.Paragraph>
          <Flex wrap gap={6} style={{ marginBottom: 12 }}>
            {stage.skills.map(skill => <Tag key={skill} color="geekblue">{skill}</Tag>)}
          </Flex>
          <Progress percent={stats.percent} size="small" format={() => `${stats.done}/${stats.total}`} />
        </div>
        <List
          style={{ flex: '2 1 420px' }}
          size="small"
          dataSource={stage.items}
          renderItem={(item, itemIndex) => (
            <List.Item
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(roadmapItemPath(item, articles))}
              extra={<Tag color={TYPE_META[item.type].color} icon={TYPE_META[item.type].icon}>{TYPE_META[item.type].label}</Tag>}
            >
              <Flex gap={10} align="center">
                <ItemStatus item={item} />
                <Typography.Text type="secondary">{`${index}.${itemIndex + 1}`}</Typography.Text>
                <Typography.Link>{item.title}</Typography.Link>
              </Flex>
            </List.Item>
          )}
        />
      </Flex>
    </Card>
  )
}
