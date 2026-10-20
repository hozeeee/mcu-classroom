import type { AnchorHTMLAttributes, ReactElement, ReactNode } from 'react'
import type { Components } from 'react-markdown'
import { isValidElement } from 'react'
import Markdown from 'react-markdown'
import { Link } from 'react-router'
import remarkGfm from 'remark-gfm'
import { openExternal } from '../../platform'
import { CircuitEmbed } from './CircuitEmbed'
import { CodeBlock } from './CodeBlock'

function MarkdownLink({ href = '', children }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href.startsWith('/'))
    return <Link to={href}>{children}</Link>
  if (href.startsWith('#'))
    return <a href={href}>{children}</a>
  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault()
        openExternal(href)
      }}
    >
      {children}
    </a>
  )
}

function MarkdownPre({ children }: { children?: ReactNode }) {
  if (!isValidElement(children))
    return <pre>{children}</pre>
  const code = children as ReactElement<{ className?: string, children?: ReactNode }>
  const lang = /language-([\w-]+)/.exec(code.props.className ?? '')?.[1]
  const text = String(code.props.children ?? '').replace(/\n$/, '')
  if (lang === 'circuit')
    return <CircuitEmbed exampleId={text.trim()} />
  return <CodeBlock code={text} lang={lang} />
}

const components: Components = {
  a: MarkdownLink,
  pre: MarkdownPre,
}

export function MarkdownView({ source }: { source: string }) {
  return (
    <div className="markdown-body">
      <Markdown remarkPlugins={[remarkGfm]} components={components}>{source}</Markdown>
    </div>
  )
}
