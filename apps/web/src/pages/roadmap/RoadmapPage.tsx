import { Alert, Anchor, Col, Row } from 'antd'
import { PageHeader } from '../../components/PageHeader'
import { QueryState } from '../../components/QueryState'
import { useRoadmap } from '../../queries/content'
import { StageCard } from './StageCard'

export default function RoadmapPage() {
  const { data = [], isLoading, error, refetch } = useRoadmap()

  return (
    <>
      <PageHeader
        title="学习路线"
        description="按阶段循序渐进：先补电子基础，再用 Arduino 入门编程，然后学习通信协议，最后进阶 ESP32 / STM32 / Pico。每完成一篇文章或项目，在对应页面标记「已完成」即可记录进度。"
      />
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        title="没有开发板也可以开始：阶段 0 ~ 2 的大部分实验都能在「电路实验室」里用 Arduino Uno 仿真完成。"
      />
      <QueryState loading={isLoading} error={error} onRetry={refetch}>
        <Row gutter={24}>
          <Col xs={24} xl={20}>
            {data.map((stage, index) => <StageCard key={stage.id} stage={stage} index={index} />)}
          </Col>
          <Col xs={0} xl={4}>
            <Anchor
              offsetTop={72}
              items={data.map(stage => ({ key: stage.id, href: `#${stage.id}`, title: stage.title }))}
            />
          </Col>
        </Row>
      </QueryState>
    </>
  )
}
