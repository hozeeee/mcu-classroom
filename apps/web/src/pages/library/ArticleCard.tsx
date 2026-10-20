import type { ArticleMeta } from '@mcu/shared'
import { CheckCircleFilled, ClockCircleOutlined } from '@ant-design/icons'
import { Card, Flex, Tag, Typography } from 'antd'
import { useNavigate } from 'react-router'
import { DifficultyTag } from '../../components/DifficultyTag'
import { useProgressMap } from '../../queries/progress'

export function ArticleCard({ article }: { article: ArticleMeta }) {
  const navigate = useNavigate()
  const status = useProgressMap().get(`article:${article.slug}`)

  return (
    <Card hoverable size="small" style={{ height: '100%' }} onClick={() => navigate(`/library/${article.category}/${article.slug}`)}>
      <Flex justify="space-between" gap={8}>
        <Typography.Text strong>{article.title}</Typography.Text>
        {status === 'done' && <CheckCircleFilled style={{ color: '#52c41a' }} />}
        {status === 'doing' && <ClockCircleOutlined style={{ color: '#1677ff' }} />}
      </Flex>
      <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: '8px 0', minHeight: 44 }}>
        {article.summary}
      </Typography.Paragraph>
      <Flex wrap gap={6}>
        <DifficultyTag value={article.difficulty} />
        <Tag>{`${article.minutes} 分钟`}</Tag>
        {article.tags.slice(0, 3).map(tag => <Tag key={tag} color="geekblue">{tag}</Tag>)}
      </Flex>
    </Card>
  )
}
