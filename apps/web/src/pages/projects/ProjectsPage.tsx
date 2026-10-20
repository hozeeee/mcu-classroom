import type { BoardFamily, Difficulty } from '@mcu/shared'
import { BOARD_FAMILY_LABELS, getBoard } from '@mcu/shared'
import { Col, Empty, Flex, Row, Segmented, Select, Tabs } from 'antd'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { PageHeader } from '../../components/PageHeader'
import { QueryState } from '../../components/QueryState'
import { DIFFICULTY_META } from '../../constants/meta'
import { useExamples } from '../../queries/content'
import { ExampleCard } from './ExampleCard'
import { MyProjects } from './MyProjects'

function ExampleList() {
  const { data = [], isLoading, error, refetch } = useExamples()
  const [family, setFamily] = useState<BoardFamily | 'all'>('all')
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')

  const filtered = useMemo(() => data.filter(item =>
    (family === 'all' || getBoard(item.boardId)?.family === family)
    && (difficulty === 'all' || item.difficulty === difficulty),
  ), [data, family, difficulty])

  return (
    <>
      <Flex gap={12} wrap style={{ marginBottom: 16 }}>
        <Select
          value={family}
          onChange={setFamily}
          style={{ width: 180 }}
          options={[{ value: 'all', label: '全部平台' }, ...Object.entries(BOARD_FAMILY_LABELS).map(([value, label]) => ({ value: value as BoardFamily, label }))]}
        />
        <Segmented<Difficulty | 'all'>
          value={difficulty}
          onChange={setDifficulty}
          options={[{ value: 'all', label: '全部难度' }, ...Object.entries(DIFFICULTY_META).map(([value, meta]) => ({ value: value as Difficulty, label: meta.label }))]}
        />
      </Flex>
      <QueryState loading={isLoading} error={error} onRetry={refetch}>
        {filtered.length === 0
          ? <Empty description="没有匹配的项目" />
          : (
              <Row gutter={[16, 16]}>
                {filtered.map(project => (
                  <Col key={project.id} xs={24} md={12} xl={8} xxl={6}>
                    <ExampleCard project={project} />
                  </Col>
                ))}
              </Row>
            )}
      </QueryState>
    </>
  )
}

export default function ProjectsPage() {
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') ?? 'examples'

  return (
    <>
      <PageHeader
        title="实战项目"
        description="每个项目都包含物料清单、接线图、完整代码和讲解。Arduino Uno 项目可以直接在浏览器里仿真，其他平台连接实物后一键烧录。"
      />
      <Tabs
        activeKey={tab}
        onChange={key => setParams({ tab: key }, { replace: true })}
        items={[
          { key: 'examples', label: '示例项目', children: <ExampleList /> },
          { key: 'mine', label: '我的项目', children: <MyProjects /> },
        ]}
      />
    </>
  )
}
