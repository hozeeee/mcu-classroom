import type { Article } from '@mcu/shared'
import { DIFFICULTY_META } from '../constants/meta'

export interface MarkdownSection {
  title: string
  content: string
}

const FENCE = /^\s*(?:`{3,}|~{3,})/

/** 按二级标题拆分 markdown，忽略代码块里的 `## ` 行；标题前的引言不单独成节 */
export function splitSections(markdown: string): MarkdownSection[] {
  const sections: MarkdownSection[] = []
  let current: { title: string, lines: string[] } | null = null
  let inFence = false
  for (const line of markdown.split('\n')) {
    if (FENCE.test(line))
      inFence = !inFence
    const heading = !inFence && line.startsWith('## ')
    if (heading) {
      if (current)
        sections.push({ title: current.title, content: current.lines.join('\n').trim() })
      current = { title: line.slice(3).replace(/[*`]/g, '').trim(), lines: [line] }
    }
    else {
      current?.lines.push(line)
    }
  }
  if (current)
    sections.push({ title: current.title, content: current.lines.join('\n').trim() })
  return sections
}

/** 电路仿真嵌入块对外部 AI 没有意义，替换成文字说明 */
function normalizeForAi(markdown: string): string {
  return markdown.replace(/^```circuit\n([^`]*)```$/gm, (_, id: string) => `（此处原文嵌入了电路仿真示意图：${id.trim()}）`)
}

interface AskAiPromptOptions {
  article: Article
  categoryName: string
  /** 只复制某一节时传入 */
  section?: MarkdownSection
  /** false 时只复制正文，不带提问模板 */
  withTemplate?: boolean
}

/** 生成可直接粘贴给其他 AI 的提问内容 */
export function buildAskAiPrompt({ article, categoryName, section, withTemplate = true }: AskAiPromptOptions): string {
  const body = normalizeForAi(section ? section.content : article.body).trim()
  const content = `# ${article.title}\n\n${body}`
  if (!withTemplate)
    return content

  const source = section ? `《${article.title}》中「${section.title}」这一节` : `《${article.title}》`
  const meta = [
    `分类：${categoryName}`,
    `难度：${DIFFICULTY_META[article.difficulty].label}`,
    article.tags.length > 0 ? `标签：${article.tags.join('、')}` : '',
  ].filter(Boolean).join('，')

  return [
    `我正在学习单片机，下面是学习资料${source}的内容（${meta}）。`,
    '请结合这份资料，用通俗易懂的方式回答我的问题；涉及代码或接线时请给出具体示例，如果发现资料中有错误或过时的地方也请指出。',
    '',
    '===== 资料开始 =====',
    content,
    '===== 资料结束 =====',
    '',
    '我的问题是：',
    '',
  ].join('\n')
}
