import type { Article } from '@mcu/shared'
import type { MenuProps } from 'antd'
import { CheckOutlined, DownOutlined, RobotOutlined } from '@ant-design/icons'
import { App, Button, Dropdown, Space, Tooltip } from 'antd'
import { useMemo, useState } from 'react'
import { buildAskAiPrompt, splitSections } from '../../utils/askAi'
import { copyText } from '../../utils/clipboard'

interface AskAiButtonProps {
  article: Article
  categoryName: string
}

/** 把文章（或某一节）连同提问模板复制到剪贴板，方便粘贴给其他 AI 提问 */
export function AskAiButton({ article, categoryName }: AskAiButtonProps) {
  const { message } = App.useApp()
  const [copied, setCopied] = useState(false)
  const sections = useMemo(() => splitSections(article.body), [article.body])

  const copy = async (text: string, tip: string) => {
    try {
      await copyText(text)
      setCopied(true)
      setTimeout(setCopied, 1500, false)
      void message.success(tip)
    }
    catch (error) {
      void message.error((error as Error).message)
    }
  }

  const copyFull = () => copy(
    buildAskAiPrompt({ article, categoryName }),
    '已复制全文和提问模板，粘贴到 AI 对话框后在末尾写上你的问题即可',
  )

  const items: MenuProps['items'] = [
    { key: 'full', label: '复制全文 + 提问模板' },
    { key: 'raw', label: '仅复制全文（不带模板）' },
    ...(sections.length > 1
      ? [{
          type: 'group' as const,
          key: 'sections',
          label: '只复制某一节 + 提问模板',
          children: sections.map((section, index) => ({ key: `section:${index}`, label: section.title })),
        }]
      : []),
  ]

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'full')
      return void copyFull()
    if (key === 'raw')
      return void copy(buildAskAiPrompt({ article, categoryName, withTemplate: false }), '已复制全文')
    const section = sections[Number(key.replace('section:', ''))]
    if (section) {
      void copy(
        buildAskAiPrompt({ article, categoryName, section }),
        `已复制「${section.title}」和提问模板，粘贴到 AI 对话框后在末尾写上你的问题即可`,
      )
    }
  }

  return (
    <Space.Compact>
      <Tooltip title="复制文章内容和提问模板，粘贴到 DeepSeek、豆包、Kimi、ChatGPT 等 AI 中提问">
        <Button icon={copied ? <CheckOutlined /> : <RobotOutlined />} onClick={() => void copyFull()}>
          {copied ? '已复制' : '复制去问 AI'}
        </Button>
      </Tooltip>
      <Dropdown
        trigger={['click']}
        placement="bottomRight"
        menu={{ items, onClick: onMenuClick, style: { maxHeight: 400, overflowY: 'auto' } }}
      >
        <Button icon={<DownOutlined />} aria-label="更多复制方式" />
      </Dropdown>
    </Space.Compact>
  )
}
