import type { ReactNode } from 'react'
import type { SerialFormatOptions } from './serialLog'
import type { SerialLog } from './useSerialLog'
import { ClearOutlined, DownloadOutlined } from '@ant-design/icons'
import { Button, Checkbox, Flex, Segmented, Tooltip } from 'antd'
import { useState } from 'react'
import { downloadText } from '../../utils/download'
import { SerialConsole } from './SerialConsole'
import { entriesToText } from './serialLog'
import { SerialPlotter } from './SerialPlotter'
import { SerialSendBar } from './SerialSendBar'
import './serial.css'

type ViewMode = 'text' | 'plot'

interface SerialMonitorProps {
  log: SerialLog
  canSend: boolean
  /** 返回 false 表示未发出（如未连接） */
  onSend: (text: string) => boolean | void
  /** 工具栏左侧的额外控件（端口、波特率选择等） */
  extra?: ReactNode
  placeholder?: string
}

/** 串口监视器：文本 / HEX / 时间戳显示、绘图、发送、保存日志。真实串口与仿真串口共用 */
export function SerialMonitor({ log, canSend, onSend, extra, placeholder }: SerialMonitorProps) {
  const [view, setView] = useState<ViewMode>('text')
  const [options, setOptions] = useState<SerialFormatOptions>({ hex: false, timestamp: false })

  const send = (text: string) => {
    const result = onSend(text)
    if (result !== false)
      log.appendTx(text)
    return result
  }

  const save = () => downloadText(entriesToText(log.entries, { ...options, timestamp: true }), `serial-${Date.now()}.log`, 'text/plain')

  return (
    <div className="serial-monitor">
      <Flex gap={8} wrap align="center">
        {extra}
        <Segmented<ViewMode>
          size="small"
          value={view}
          onChange={setView}
          options={[{ value: 'text', label: '文本' }, { value: 'plot', label: '绘图' }]}
        />
        <Checkbox checked={options.hex} onChange={event => setOptions({ ...options, hex: event.target.checked })}>HEX</Checkbox>
        <Checkbox checked={options.timestamp} onChange={event => setOptions({ ...options, timestamp: event.target.checked })}>时间戳</Checkbox>
        <Tooltip title="清空">
          <Button size="small" icon={<ClearOutlined />} onClick={log.clear} />
        </Tooltip>
        <Tooltip title="保存日志">
          <Button size="small" icon={<DownloadOutlined />} disabled={!log.entries.length} onClick={save} />
        </Tooltip>
      </Flex>
      <div className="serial-monitor-body">
        {view === 'text'
          ? <SerialConsole entries={log.entries} options={options} placeholder={placeholder} />
          : <SerialPlotter entries={log.entries} />}
      </div>
      <SerialSendBar disabled={!canSend} onSend={send} />
    </div>
  )
}
