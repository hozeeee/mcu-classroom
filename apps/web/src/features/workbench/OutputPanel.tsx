import type { SerialLog } from '../serial/useSerialLog'
import { getBoard } from '@mcu/shared'
import { Alert, Tabs, Typography } from 'antd'
import { Link } from 'react-router'
import { TaskLogPanel } from '../../components/TaskLogPanel'
import { SerialMonitor } from '../serial/SerialMonitor'

export type OutputTab = 'log' | 'serial' | 'help'

interface OutputPanelProps {
  activeTab: OutputTab
  onTabChange: (tab: OutputTab) => void
  taskId?: string
  sizeSummary?: string
  boardId: string
  simLog: SerialLog
  simRunning: boolean
  onSimSend: (text: string) => void
}

function UploadHelp({ boardId }: { boardId: string }) {
  const board = getBoard(boardId)
  return (
    <div className="workbench-help">
      <Alert
        type="info"
        showIcon
        title={`${board?.name ?? boardId} 烧录说明`}
        description={board?.uploadHint}
        style={{ marginBottom: 12 }}
      />
      <Typography.Paragraph>
        第一次烧录前，请先到
        {' '}
        <Link to="/environment">环境中心</Link>
        {' '}
        安装 arduino-cli 与对应的开发板支持包，并按系统提示安装 USB 串口驱动。
      </Typography.Paragraph>
      <Typography.Paragraph>
        烧录失败时可以查看
        {' '}
        <Link to="/troubleshooting">排障指南</Link>
        ，常见原因有：端口选错、串口被占用（关掉串口监视器）、驱动未安装、板子型号选错。
      </Typography.Paragraph>
    </div>
  )
}

/** 工作台底部：编译/烧录日志、仿真串口、烧录说明 */
export function OutputPanel(props: OutputPanelProps) {
  const { activeTab, onTabChange, taskId, sizeSummary, boardId, simLog, simRunning, onSimSend } = props
  return (
    <Tabs
      className="workbench-output"
      size="small"
      activeKey={activeTab}
      onChange={key => onTabChange(key as OutputTab)}
      tabBarExtraContent={sizeSummary && <Typography.Text type="secondary" style={{ fontSize: 12 }}>{sizeSummary}</Typography.Text>}
      items={[
        {
          key: 'log',
          label: '编译 / 烧录输出',
          children: <TaskLogPanel taskId={taskId} height="100%" placeholder="点击「编译」「仿真运行」或「烧录」后，这里会显示 arduino-cli 的输出" />,
        },
        {
          key: 'serial',
          label: '仿真串口',
          children: (
            <SerialMonitor
              log={simLog}
              canSend={simRunning}
              onSend={(text) => {
                if (!simRunning)
                  return false
                onSimSend(text)
              }}
              placeholder="仿真运行后，程序中 Serial.print 的内容会显示在这里"
            />
          ),
        },
        { key: 'help', label: '烧录说明', children: <UploadHelp boardId={boardId} /> },
      ]}
    />
  )
}
