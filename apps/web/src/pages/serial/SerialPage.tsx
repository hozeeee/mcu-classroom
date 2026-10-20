import { Alert, Card } from 'antd'
import { useState } from 'react'
import { PageHeader } from '../../components/PageHeader'
import { SerialMonitor } from '../../features/serial/SerialMonitor'
import { useSerialConnection } from '../../features/serial/useSerialConnection'
import { useSerialLog } from '../../features/serial/useSerialLog'
import { SerialConnectBar } from './SerialConnectBar'

const DEFAULT_BAUD = 9600

/** 串口调试助手：连接真实开发板，收发数据、绘制曲线 */
export default function SerialPage() {
  const log = useSerialLog()
  const serial = useSerialConnection({ onData: log.appendRx, onInfo: log.appendInfo })
  const [port, setPort] = useState<string>()
  const [baud, setBaud] = useState(DEFAULT_BAUD)

  return (
    <>
      <PageHeader
        title="串口调试"
        description="串口是单片机和电脑“聊天”的通道：程序里 Serial.print 的内容会显示在这里，你也可以发送命令给板子。"
      />
      <Alert
        type="info"
        showIcon
        closable
        style={{ marginBottom: 16 }}
        title="使用提示"
        description="① 波特率必须和程序里 Serial.begin(…) 的一致，否则会显示乱码；② 同一个串口同时只能被一个程序占用，烧录前请先断开；③ 切到「绘图」可以把数字输出画成曲线。"
      />
      {serial.error && <Alert type="error" showIcon style={{ marginBottom: 16 }} title={serial.error} />}
      <Card size="small" styles={{ body: { height: 'calc(100vh - 340px)', minHeight: 360 } }}>
        <SerialMonitor
          log={log}
          canSend={serial.status === 'open'}
          onSend={serial.send}
          placeholder="选择端口与波特率后点击「连接」"
          extra={(
            <SerialConnectBar
              status={serial.status}
              port={port}
              baud={baud}
              onPortChange={setPort}
              onBaudChange={setBaud}
              onConnect={() => port && serial.connect(port, baud)}
              onDisconnect={() => {
                serial.disconnect()
                log.appendInfo('已断开')
              }}
            />
          )}
        />
      </Card>
    </>
  )
}
