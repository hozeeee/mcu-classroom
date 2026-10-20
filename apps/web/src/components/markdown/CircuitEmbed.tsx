import { ExperimentOutlined } from '@ant-design/icons'
import { Button, Card, Skeleton } from 'antd'
import { useNavigate } from 'react-router'
import { CircuitViewer } from '../../features/circuit/CircuitViewer'
import { useExample } from '../../queries/content'

/** 文章中 ```circuit 代码块：内容为示例项目 id，渲染该项目的接线图 */
export function CircuitEmbed({ exampleId }: { exampleId: string }) {
  const navigate = useNavigate()
  const { data, isLoading, error } = useExample(exampleId)

  if (isLoading)
    return <Skeleton.Node active style={{ width: '100%', height: 320 }} />
  if (error || !data) {
    return (
      <Card size="small">
        未找到电路示例：
        {exampleId}
      </Card>
    )
  }

  return (
    <Card
      size="small"
      title={`接线图 · ${data.title}`}
      style={{ margin: '1em 0' }}
      extra={(
        <Button size="small" type="link" icon={<ExperimentOutlined />} onClick={() => navigate(`/projects/${data.id}`)}>
          查看项目
        </Button>
      )}
      styles={{ body: { padding: 0 } }}
    >
      <div style={{ height: 360 }}>
        <CircuitViewer circuit={data.circuit} />
      </div>
    </Card>
  )
}
