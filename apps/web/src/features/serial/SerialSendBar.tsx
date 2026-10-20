import { SendOutlined } from '@ant-design/icons'
import { Button, Input, Select, Space } from 'antd'
import { useState } from 'react'

const LINE_ENDINGS = [
  { value: '', label: '无换行' },
  { value: '\n', label: '换行 \\n' },
  { value: '\r\n', label: '回车换行 \\r\\n' },
  { value: '\r', label: '回车 \\r' },
]

interface SerialSendBarProps {
  disabled?: boolean
  /** 返回 false 表示发送失败，输入框内容会保留 */
  onSend: (text: string) => boolean | void
}

/** 发送栏：回车发送，↑ 键调出上一条 */
export function SerialSendBar({ disabled, onSend }: SerialSendBarProps) {
  const [text, setText] = useState('')
  const [lineEnding, setLineEnding] = useState('\n')
  const [history, setHistory] = useState<string[]>([])

  const send = () => {
    if (disabled || (!text && !lineEnding))
      return
    if (onSend(text + lineEnding) === false)
      return
    if (text)
      setHistory(current => [text, ...current.filter(item => item !== text)].slice(0, 20))
    setText('')
  }

  return (
    <Space.Compact style={{ width: '100%' }}>
      <Input
        value={text}
        disabled={disabled}
        placeholder={disabled ? '连接后可发送' : '输入要发送的内容，回车发送'}
        onChange={event => setText(event.target.value)}
        onPressEnter={send}
        onKeyDown={(event) => {
          if (event.key === 'ArrowUp' && history.length) {
            event.preventDefault()
            setText(history[0])
          }
        }}
      />
      <Select value={lineEnding} options={LINE_ENDINGS} onChange={setLineEnding} style={{ width: 150 }} disabled={disabled} />
      <Button type="primary" icon={<SendOutlined />} disabled={disabled} onClick={send}>发送</Button>
    </Space.Compact>
  )
}
