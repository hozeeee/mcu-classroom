import type { ExampleProject } from '@mcu/shared'
import { Card, Flex, Table } from 'antd'
import { CircuitViewer } from '../../features/circuit/CircuitViewer'

export function ProjectWiring({ project }: { project: ExampleProject }) {
  return (
    <Flex vertical gap={16}>
      <Card size="small" styles={{ body: { padding: 0 } }}>
        <div style={{ height: 420 }}>
          <CircuitViewer circuit={project.circuit} />
        </div>
      </Card>
      <Table
        size="small"
        pagination={false}
        rowKey={(row, index) => `${row.from}-${row.to}-${index}`}
        dataSource={project.wiring}
        columns={[
          { title: '#', key: 'index', width: 50, render: (_, __, index) => index + 1 },
          { title: '从', dataIndex: 'from' },
          { title: '接到', dataIndex: 'to' },
          { title: '说明', dataIndex: 'note', render: (note?: string) => note ?? '' },
        ]}
      />
    </Flex>
  )
}
