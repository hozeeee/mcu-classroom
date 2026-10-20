import type { OsPlatform, SerialPortInfo } from '@mcu/shared'
import { ApiOutlined, ReloadOutlined } from '@ant-design/icons'
import { serialPortExample } from '@mcu/shared'
import { Button, Card, Table, Tag, Typography } from 'antd'
import { usePorts } from '../../queries/toolchain'

const COLUMNS = [
  { title: '端口', dataIndex: 'address', key: 'address', render: (address: string) => <code>{address}</code> },
  { title: '类型', key: 'protocol', render: (_: unknown, port: SerialPortInfo) => port.protocolLabel ?? port.protocol },
  {
    title: '识别到的开发板',
    key: 'board',
    render: (_: unknown, port: SerialPortInfo) => (port.boardName ? <Tag color="success">{port.boardName}</Tag> : <Typography.Text type="secondary">未识别（兼容板常见，不影响使用）</Typography.Text>),
  },
  { title: 'VID:PID', key: 'vid', render: (_: unknown, port: SerialPortInfo) => (port.vid ? `${port.vid}:${port.pid ?? ''}` : '-') },
]

/** 当前电脑上检测到的串口设备 */
export function PortsCard({ os }: { os: OsPlatform }) {
  const { data, isFetching, error, refetch } = usePorts()
  return (
    <Card
      size="small"
      title={(
        <span>
          <ApiOutlined />
          {' '}
          已连接的设备
        </span>
      )}
      extra={<Button size="small" icon={<ReloadOutlined />} loading={isFetching} onClick={() => void refetch()}>刷新</Button>}
    >
      <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
        {`插拔开发板前后各刷新一次，新出现的就是你的板子。本系统的端口名形如：${serialPortExample(os)}`}
      </Typography.Paragraph>
      <Table
        size="small"
        rowKey="address"
        pagination={false}
        dataSource={data ?? []}
        columns={COLUMNS}
        locale={{ emptyText: error ? `获取失败：${(error as Error).message}` : '没有检测到串口设备' }}
      />
    </Card>
  )
}
