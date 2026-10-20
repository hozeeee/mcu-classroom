import type { ExampleProjectSummary } from '@mcu/shared'
import { CheckCircleFilled } from '@ant-design/icons'
import { getBoard } from '@mcu/shared'
import { Card, Flex, Tag, Typography } from 'antd'
import { useNavigate } from 'react-router'
import { DifficultyTag } from '../../components/DifficultyTag'
import { useProgressMap } from '../../queries/progress'

export function ExampleCard({ project }: { project: ExampleProjectSummary }) {
  const navigate = useNavigate()
  const done = useProgressMap().get(`project:${project.id}`) === 'done'
  const board = getBoard(project.boardId)

  return (
    <Card hoverable size="small" style={{ height: '100%' }} onClick={() => navigate(`/projects/${project.id}`)}>
      <Flex justify="space-between" gap={8}>
        <Typography.Text strong>{project.title}</Typography.Text>
        {done && <CheckCircleFilled style={{ color: '#52c41a' }} />}
      </Flex>
      <Typography.Paragraph type="secondary" ellipsis={{ rows: 2 }} style={{ margin: '8px 0', minHeight: 44 }}>
        {project.summary}
      </Typography.Paragraph>
      <Flex wrap gap={6}>
        <DifficultyTag value={project.difficulty} />
        {board && <Tag color={board.simulatable ? 'green' : 'blue'}>{board.name}</Tag>}
        {board?.simulatable && <Tag color="green">可仿真</Tag>}
        {project.tags.slice(0, 2).map(tag => <Tag key={tag}>{tag}</Tag>)}
      </Flex>
    </Card>
  )
}
