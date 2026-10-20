import type { SerialStatus } from '../../features/serial/useSerialConnection'
import { ApiOutlined, DisconnectOutlined } from '@ant-design/icons'
import { SERIAL_BAUD_RATES } from '@mcu/shared'
import { Button, Select, Tag } from 'antd'
import { PortSelect } from '../../features/serial/PortSelect'

const STATUS_META: Record<SerialStatus, { color: string, label: string }> = {
  idle: { color: 'default', label: '未连接' },
  connecting: { color: 'processing', label: '连接中' },
  open: { color: 'success', label: '已连接' },
  closed: { color: 'default', label: '已断开' },
  error: { color: 'error', label: '出错' },
}

interface SerialConnectBarProps {
  status: SerialStatus
  port?: string
  baud: number
  onPortChange: (port: string) => void
  onBaudChange: (baud: number) => void
  onConnect: () => void
  onDisconnect: () => void
}

export function SerialConnectBar(props: SerialConnectBarProps) {
  const { status, port, baud } = props
  const active = status === 'open' || status === 'connecting'
  return (
    <>
      <PortSelect value={port} onChange={props.onPortChange} disabled={active} />
      <Select
        size="small"
        style={{ width: 110 }}
        value={baud}
        disabled={active}
        onChange={props.onBaudChange}
        options={SERIAL_BAUD_RATES.map(rate => ({ value: rate, label: `${rate}` }))}
      />
      {active
        ? <Button size="small" danger icon={<DisconnectOutlined />} onClick={props.onDisconnect}>断开</Button>
        : <Button size="small" type="primary" icon={<ApiOutlined />} disabled={!port} onClick={props.onConnect}>连接</Button>}
      <Tag color={STATUS_META[status].color}>{STATUS_META[status].label}</Tag>
    </>
  )
}
