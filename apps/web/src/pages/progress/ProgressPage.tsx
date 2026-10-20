import type { ProgressRecord } from '@mcu/shared'
import { App, Button, Card, Col, Popconfirm, Progress, Row, Statistic, Table, Tag } from 'antd'
import { Link } from 'react-router'
import { PageHeader } from '../../components/PageHeader'
import { QueryState } from '../../components/QueryState'
import { PROGRESS_META } from '../../constants/meta'
import { useArticleIndex, useExamples, useRoadmap } from '../../queries/content'
import { useProgress, useProgressMap, useResetProgress } from '../../queries/progress'
import { computeRoadmapStats } from '../../utils/roadmap'

function useTargetResolver() {
  const articles = useArticleIndex()
  const { data: examples = [] } = useExamples()
  return (record: ProgressRecord) => {
    if (record.targetType === 'article') {
      const meta = articles.get(record.targetId)
      return meta ? { title: meta.title, path: `/library/${meta.category}/${meta.slug}` } : { title: record.targetId, path: '/library' }
    }
    const example = examples.find(item => item.id === record.targetId)
    return { title: example?.title ?? record.targetId, path: `/projects/${record.targetId}` }
  }
}

export default function ProgressPage() {
  const { message } = App.useApp()
  const { data: records = [], isLoading, error, refetch } = useProgress()
  const { data: stages = [] } = useRoadmap()
  const progress = useProgressMap()
  const reset = useResetProgress()
  const resolve = useTargetResolver()
  const total = computeRoadmapStats(stages, progress)
  const doneCount = records.filter(item => item.status === 'done').length
  const doingCount = records.filter(item => item.status === 'doing').length

  return (
    <>
      <PageHeader
        title="学习进度"
        description="在文章页、项目页标记「学习中 / 已完成」，这里会汇总你的进度。数据保存在本机。"
        extra={(
          <Popconfirm
            title="清空全部学习进度？"
            description="该操作不可恢复"
            onConfirm={() => reset.mutate(undefined, { onSuccess: () => void message.success('已清空') })}
          >
            <Button danger>重置进度</Button>
          </Popconfirm>
        )}
      />
      <QueryState loading={isLoading} error={error} onRetry={refetch}>
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={8}>
            <Card><Statistic title="路线完成度" value={total.percent} suffix="%" /></Card>
          </Col>
          <Col xs={12} md={8}>
            <Card><Statistic title="已完成" value={doneCount} suffix="项" /></Card>
          </Col>
          <Col xs={12} md={8}>
            <Card><Statistic title="学习中" value={doingCount} suffix="项" /></Card>
          </Col>
        </Row>
        <Card title="各阶段进度" style={{ marginBottom: 16 }}>
          {stages.map((stage) => {
            const stats = computeRoadmapStats(stages, progress, stage.id)
            return (
              <Row key={stage.id} align="middle" gutter={16} style={{ marginBottom: 8 }}>
                <Col xs={24} md={6}><Link to={`/roadmap#${stage.id}`}>{stage.title}</Link></Col>
                <Col xs={24} md={18}><Progress percent={stats.percent} format={() => `${stats.done}/${stats.total}`} /></Col>
              </Row>
            )
          })}
        </Card>
        <Card title="学习记录">
          <Table<ProgressRecord>
            rowKey={record => `${record.targetType}:${record.targetId}`}
            dataSource={records}
            locale={{ emptyText: '还没有记录，去学习路线里开始第一课吧' }}
            columns={[
              { title: '类型', dataIndex: 'targetType', width: 90, render: (type: string) => (type === 'article' ? <Tag color="blue">文章</Tag> : <Tag color="purple">项目</Tag>) },
              {
                title: '名称',
                key: 'title',
                render: (_, record) => {
                  const target = resolve(record)
                  return <Link to={target.path}>{target.title}</Link>
                },
              },
              {
                title: '状态',
                dataIndex: 'status',
                width: 100,
                render: (status: ProgressRecord['status']) => <Tag color={PROGRESS_META[status].color}>{PROGRESS_META[status].label}</Tag>,
              },
              { title: '更新时间', dataIndex: 'updatedAt', width: 200, render: (value: string) => new Date(value).toLocaleString() },
            ]}
          />
        </Card>
      </QueryState>
    </>
  )
}
