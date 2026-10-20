import { BOARD_FAMILY_LABELS, BOARDS } from '@mcu/shared'
import { Card, Col, Flex, Row, Tag, Typography } from 'antd'
import { ContinueLearning } from './ContinueLearning'
import { HeroSection } from './HeroSection'
import { LearningFlow } from './LearningFlow'
import { QuickEntries } from './QuickEntries'

function SupportedBoards() {
  return (
    <Card title="支持的开发板" style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        {BOARDS.map(board => (
          <Col key={board.id} xs={24} md={12} xl={8}>
            <Card size="small" type="inner" title={board.name} extra={board.simulatable && <Tag color="green">可仿真</Tag>}>
              <Typography.Paragraph type="secondary" style={{ minHeight: 44 }}>{board.description}</Typography.Paragraph>
              <Flex wrap gap={6}>
                <Tag>{BOARD_FAMILY_LABELS[board.family]}</Tag>
                <Tag>{board.mcu}</Tag>
                <Tag>{board.logicVoltage}</Tag>
              </Flex>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  )
}

export default function HomePage() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <HeroSection />
      <ContinueLearning />
      <LearningFlow />
      <QuickEntries />
      <SupportedBoards />
    </div>
  )
}
