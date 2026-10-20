import { ReloadOutlined } from '@ant-design/icons'
import { serialPortExample } from '@mcu/shared'
import { Button, Select, Space, Tooltip } from 'antd'
import { useSystemInfo } from '../../queries/content'
import { usePorts } from '../../queries/toolchain'

interface PortSelectProps {
  value?: string
  onChange: (port: string) => void
  disabled?: boolean
  width?: number
}

/** 串口选择（由后端 arduino-cli board list 列出），带刷新按钮 */
export function PortSelect({ value, onChange, disabled, width = 220 }: PortSelectProps) {
  const ports = usePorts()
  const system = useSystemInfo()
  const example = system.data ? serialPortExample(system.data.os) : 'COM3 / /dev/ttyUSB0'
  const options = (ports.data ?? []).map(port => ({
    value: port.address,
    label: port.boardName ? `${port.address}（${port.boardName}）` : `${port.address} ${port.protocolLabel ?? ''}`.trim(),
  }))

  return (
    <Space.Compact>
      <Select
        size="small"
        style={{ width }}
        value={value}
        disabled={disabled}
        loading={ports.isFetching}
        options={options}
        onChange={onChange}
        placeholder={`选择端口，如 ${example}`}
        notFoundContent={ports.isError ? '获取失败，请先在「环境中心」安装工具链' : '没有检测到设备，插上开发板后点刷新'}
        popupMatchSelectWidth={false}
      />
      <Tooltip title="刷新端口列表">
        <Button size="small" icon={<ReloadOutlined />} disabled={disabled} onClick={() => void ports.refetch()} />
      </Tooltip>
    </Space.Compact>
  )
}
