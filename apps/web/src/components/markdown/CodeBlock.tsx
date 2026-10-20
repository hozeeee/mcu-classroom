import { CheckOutlined, CodeOutlined, CopyOutlined } from '@ant-design/icons'
import { Button, Space, Tooltip } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router'

interface CodeBlockProps {
  code: string
  lang?: string
}

const RUNNABLE_LANGS = new Set(['cpp', 'c', 'arduino', 'ino'])

export function CodeBlock({ code, lang }: CodeBlockProps) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const runnable = lang !== undefined && RUNNABLE_LANGS.has(lang) && code.includes('setup')

  const copy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(setCopied, 1500, false)
  }

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span>{lang ?? 'text'}</span>
        <Space size={0}>
          {runnable && (
            <Tooltip title="把这段代码放到工作台中编译 / 仿真">
              <Button size="small" type="text" icon={<CodeOutlined />} onClick={() => navigate('/workbench', { state: { code } })}>
                在工作台打开
              </Button>
            </Tooltip>
          )}
          <Button size="small" type="text" icon={copied ? <CheckOutlined /> : <CopyOutlined />} onClick={copy}>
            {copied ? '已复制' : '复制'}
          </Button>
        </Space>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  )
}
