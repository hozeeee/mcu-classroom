import {
  BuildOutlined,
  CaretRightOutlined,
  CloudUploadOutlined,
  MutedOutlined,
  SaveOutlined,
  SoundOutlined,
  StopOutlined,
} from '@ant-design/icons'
import { BOARDS } from '@mcu/shared'
import { Badge, Button, Divider, Flex, Input, Select, Tag, Tooltip } from 'antd'
import { PortSelect } from '../serial/PortSelect'

export interface WorkbenchToolbarProps {
  name: string
  onNameChange: (name: string) => void
  boardId: string
  onBoardChange: (boardId: string) => void
  isProject: boolean
  dirty: boolean
  saving: boolean
  onSave: () => void
  building: boolean
  onCompile: () => void
  simSupported: boolean
  simRunning: boolean
  simSeconds: number
  onSimStart: () => void
  onSimStop: () => void
  muted: boolean
  onMutedChange: (muted: boolean) => void
  port?: string
  onPortChange: (port: string) => void
  onUpload: () => void
}

export function WorkbenchToolbar(props: WorkbenchToolbarProps) {
  const { isProject, dirty, saving, building, simSupported, simRunning, port } = props
  return (
    <Flex className="workbench-toolbar" gap={8} wrap align="center">
      <Input
        size="small"
        style={{ width: 180 }}
        value={props.name}
        onChange={event => props.onNameChange(event.target.value)}
        prefix={isProject ? <Tag color="green" style={{ marginInlineEnd: 0 }}>项目</Tag> : <Tag style={{ marginInlineEnd: 0 }}>草稿</Tag>}
      />
      <Select
        size="small"
        style={{ width: 200 }}
        value={props.boardId}
        onChange={props.onBoardChange}
        disabled={simRunning}
        options={BOARDS.map(board => ({ value: board.id, label: board.name }))}
      />
      <Tooltip title={isProject ? '保存（Ctrl+S）' : '保存为项目，之后可在「我的项目」中打开'}>
        <Badge dot={dirty}>
          <Button size="small" icon={<SaveOutlined />} loading={saving} onClick={props.onSave}>
            {isProject ? '保存' : '保存为项目'}
          </Button>
        </Badge>
      </Tooltip>

      <Divider orientation="vertical" />
      <Tooltip title="用 arduino-cli 编译，检查语法错误与程序大小">
        <Button size="small" icon={<BuildOutlined />} loading={building} onClick={props.onCompile}>编译</Button>
      </Tooltip>
      {simRunning
        ? (
            <Button size="small" danger icon={<StopOutlined />} onClick={props.onSimStop}>
              {`停止仿真 ${props.simSeconds.toFixed(1)}s`}
            </Button>
          )
        : (
            <Tooltip title={simSupported ? '编译后在浏览器中运行，无需真实硬件' : '目前只有 Arduino Uno 支持浏览器仿真'}>
              <Button size="small" type="primary" icon={<CaretRightOutlined />} disabled={!simSupported || building} onClick={props.onSimStart}>
                仿真运行
              </Button>
            </Tooltip>
          )}
      <Tooltip title={props.muted ? '打开蜂鸣器声音' : '静音蜂鸣器'}>
        <Button size="small" type="text" icon={props.muted ? <MutedOutlined /> : <SoundOutlined />} onClick={() => props.onMutedChange(!props.muted)} />
      </Tooltip>

      <Divider orientation="vertical" />
      <PortSelect value={port} onChange={props.onPortChange} disabled={building} width={200} />
      <Tooltip title={port ? '编译并烧录到真实开发板' : '先选择开发板所在端口'}>
        <Button size="small" icon={<CloudUploadOutlined />} disabled={!port || simRunning} loading={building} onClick={props.onUpload}>
          烧录
        </Button>
      </Tooltip>
    </Flex>
  )
}
