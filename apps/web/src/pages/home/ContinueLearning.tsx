import { ArrowRightOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Progress, Typography } from 'antd'
import { useNavigate } from 'react-router'
import { useArticleIndex, useRoadmap } from '../../queries/content'
import { useProgressMap } from '../../queries/progress'
import { computeRoadmapStats, roadmapItemPath } from '../../utils/roadmap'

/** 首页：路线总进度 + 下一步该学什么 */
export function ContinueLearning() {
  const navigate = useNavigate()
  const { data: stages = [] } = useRoadmap()
  const progress = useProgressMap()
  const articles = useArticleIndex()
  const stats = computeRoadmapStats(stages, progress)

  return (
    <Card title="我的学习" style={{ marginBottom: 24 }}>
      <Flex gap={32} align="center" wrap>
        <Progress type="circle" percent={stats.percent} size={96} />
        <div style={{ flex: 1, minWidth: 240 }}>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 8 }}>
            路线共
            {' '}
            {stats.total}
            {' '}
            个学习任务，已完成
            {' '}
            {stats.done}
            {' '}
            个
          </Typography.Paragraph>
          {stats.next
            ? (
                <>
                  <Typography.Text strong>
                    下一步：
                    {stats.next.stage.title}
                    {' · '}
                    {stats.next.item.title}
                  </Typography.Text>
                  <div style={{ marginTop: 12 }}>
                    <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => navigate(roadmapItemPath(stats.next!.item, articles))}>
                      继续学习
                    </Button>
                  </div>
                </>
              )
            : <Typography.Text strong>全部完成！去实战项目里挑战更多玩法吧。</Typography.Text>}
        </div>
      </Flex>
    </Card>
  )
}
