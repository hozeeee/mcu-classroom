import type { BoardPin, PinKind } from '@mcu/shared'
import { BOARDS, DEFAULT_BOARD_ID, getBoard } from '@mcu/shared'
import { Descriptions, Flex, Select, Table, Tag } from 'antd'
import { useState } from 'react'
import { ToolCard } from './ToolCard'

const KIND_META: Record<PinKind, { label: string, color: string }> = {
  digital: { label: '数字', color: 'blue' },
  analog: { label: '模拟', color: 'green' },
  pwm: { label: 'PWM', color: 'purple' },
  power: { label: '电源', color: 'red' },
  ground: { label: '地', color: 'default' },
  control: { label: '控制', color: 'orange' },
}

/** 开发板引脚速查 */
export function PinoutViewer() {
  const [boardId, setBoardId] = useState(DEFAULT_BOARD_ID)
  const board = getBoard(boardId)!

  return (
    <ToolCard title="开发板引脚速查" description="接线前先确认引脚功能：哪些能 PWM、哪些能读模拟量、I2C / SPI / 串口在哪几个脚。">
      <Flex vertical gap={12}>
        <Select value={boardId} onChange={setBoardId} style={{ width: 260 }} options={BOARDS.map(item => ({ value: item.id, label: item.name }))} />
        <Descriptions
          size="small"
          column={{ xs: 1, md: 3 }}
          items={[
            { key: 'mcu', label: '主控', children: board.mcu },
            { key: 'clock', label: '主频', children: board.clock },
            { key: 'voltage', label: 'IO 电平', children: board.logicVoltage },
            { key: 'flash', label: 'Flash', children: board.flash },
            { key: 'ram', label: 'RAM', children: board.ram },
            { key: 'led', label: '板载 LED', children: board.builtinLed ?? '-' },
          ]}
        />
        <Table<BoardPin>
          className="pinout-table"
          size="small"
          rowKey="id"
          pagination={false}
          scroll={{ y: 360 }}
          dataSource={board.pins}
          columns={[
            { title: '丝印', dataIndex: 'label', width: 90 },
            { title: '程序中写法', dataIndex: 'id', width: 110, render: (id: string) => <code>{id}</code> },
            {
              title: '类型',
              dataIndex: 'kinds',
              filters: Object.entries(KIND_META).map(([value, meta]) => ({ value, text: meta.label })),
              onFilter: (value, record) => record.kinds.includes(value as PinKind),
              render: (kinds: PinKind[]) => (
                <Flex wrap gap={4}>
                  {kinds.map(kind => <Tag key={kind} color={KIND_META[kind].color}>{KIND_META[kind].label}</Tag>)}
                </Flex>
              ),
            },
            {
              title: '复用功能',
              dataIndex: 'functions',
              render: (fns?: string[]) => fns && <Flex wrap gap={4}>{fns.map(fn => <Tag key={fn}>{fn}</Tag>)}</Flex>,
            },
          ]}
        />
      </Flex>
    </ToolCard>
  )
}
