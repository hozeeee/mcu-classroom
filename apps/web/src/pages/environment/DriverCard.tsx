import type { OsPlatform } from '@mcu/shared'
import { LinkOutlined, UsbOutlined } from '@ant-design/icons'
import { getDriverHints, OS_LABELS } from '@mcu/shared'
import { Button, Card, Col, Row, Segmented, Typography } from 'antd'
import { useState } from 'react'
import { openExternal } from '../../platform'

const OS_OPTIONS: OsPlatform[] = ['windows', 'macos', 'linux']

/** USB 转串口驱动安装指引：默认显示后端所在系统，可切换查看其他系统 */
export function DriverCard({ os }: { os: OsPlatform }) {
  const [selected, setSelected] = useState<OsPlatform>()
  const current = selected ?? (os === 'unknown' ? 'windows' : os)
  const hints = getDriverHints(current)

  return (
    <Card
      size="small"
      title={(
        <span>
          <UsbOutlined />
          {' '}
          驱动安装
        </span>
      )}
      extra={(
        <Segmented<OsPlatform>
          size="small"
          value={current}
          onChange={setSelected}
          options={OS_OPTIONS.map(value => ({ value, label: value === os ? `${OS_LABELS[value]}（当前）` : OS_LABELS[value] }))}
        />
      )}
    >
      <Typography.Paragraph type="secondary" style={{ fontSize: 13 }}>
        开发板通过 USB 转串口芯片与电脑通信。插上板子后如果「端口」列表里看不到设备，多半是缺驱动——先看板子 USB 口旁边的芯片型号。
      </Typography.Paragraph>
      <Row gutter={[12, 12]}>
        {hints.map(hint => (
          <Col key={hint.chip} xs={24} lg={8}>
            <Card size="small" type="inner" title={hint.chip} style={{ height: '100%' }}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>{hint.boards}</Typography.Text>
              <ol style={{ paddingLeft: 18, margin: '8px 0' }}>
                {hint.steps.map(step => <li key={step} style={{ fontSize: 13 }}>{step}</li>)}
              </ol>
              {hint.url && (
                <Button size="small" type="link" icon={<LinkOutlined />} style={{ padding: 0 }} onClick={() => openExternal(hint.url!)}>
                  官方下载页
                </Button>
              )}
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  )
}
