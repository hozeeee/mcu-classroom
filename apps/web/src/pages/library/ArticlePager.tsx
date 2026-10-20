import type { ArticleMeta } from '@mcu/shared'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Button, Flex } from 'antd'
import { useNavigate } from 'react-router'
import { useArticles, useCategories } from '../../queries/content'

/** 上一篇 / 下一篇：按分类顺序 + 分类内 order 排列 */
export function ArticlePager({ article }: { article: ArticleMeta }) {
  const navigate = useNavigate()
  const { data: articles = [] } = useArticles()
  const { data: categories } = useCategories()
  const categoryOrder = (categories?.articles ?? []).map(item => item.id)
  const ordered = [...articles].sort((a, b) =>
    categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category) || a.order - b.order)
  const index = ordered.findIndex(item => item.slug === article.slug)
  const prev = index > 0 ? ordered[index - 1] : undefined
  const next = index >= 0 ? ordered[index + 1] : undefined
  const go = (item: ArticleMeta) => navigate(`/library/${item.category}/${item.slug}`)

  return (
    <Flex justify="space-between" gap={16} style={{ marginTop: 32 }}>
      {prev ? <Button icon={<LeftOutlined />} onClick={() => go(prev)}>{prev.title}</Button> : <span />}
      {next && (
        <Button type="primary" onClick={() => go(next)}>
          {next.title}
          <RightOutlined />
        </Button>
      )}
    </Flex>
  )
}
