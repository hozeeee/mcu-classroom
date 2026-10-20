import type { Difficulty } from '@mcu/shared'
import { Col, Empty, Flex, Input, Row, Segmented, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { PageHeader } from '../../components/PageHeader'
import { QueryState } from '../../components/QueryState'
import { DIFFICULTY_META } from '../../constants/meta'
import { useArticles, useCategories } from '../../queries/content'
import { ArticleCard } from './ArticleCard'

type DifficultyFilter = Difficulty | 'all'

export default function LibraryPage() {
  const categories = useCategories()
  const articles = useArticles()
  const [keyword, setKeyword] = useState('')
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('all')

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return (articles.data ?? []).filter(item =>
      (difficulty === 'all' || item.difficulty === difficulty)
      && (!q || item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q) || item.tags.some(tag => tag.toLowerCase().includes(q))),
    )
  }, [articles.data, keyword, difficulty])

  return (
    <>
      <PageHeader
        title="知识库"
        description="从「单片机是什么」到通信协议、寄存器编程、PCB 设计。建议按学习路线的顺序阅读，也可以按需查阅。"
        extra={(
          <Flex gap={12} wrap>
            <Segmented<DifficultyFilter>
              value={difficulty}
              onChange={setDifficulty}
              options={[{ value: 'all', label: '全部' }, ...Object.entries(DIFFICULTY_META).map(([value, meta]) => ({ value: value as Difficulty, label: meta.label }))]}
            />
            <Input.Search allowClear placeholder="筛选文章" value={keyword} onChange={e => setKeyword(e.target.value)} style={{ width: 220 }} />
          </Flex>
        )}
      />
      <QueryState loading={categories.isLoading || articles.isLoading} error={categories.error ?? articles.error} onRetry={() => void articles.refetch()}>
        {filtered.length === 0 && <Empty description="没有匹配的文章" />}
        {categories.data?.articles.map((category) => {
          const list = filtered.filter(item => item.category === category.id)
          if (list.length === 0)
            return null
          return (
            <section key={category.id} style={{ marginBottom: 28 }}>
              <Typography.Title level={4} style={{ marginBottom: 4 }}>{category.name}</Typography.Title>
              <Typography.Paragraph type="secondary">{category.description}</Typography.Paragraph>
              <Row gutter={[16, 16]}>
                {list.map(article => (
                  <Col key={article.slug} xs={24} md={12} xl={8} xxl={6}>
                    <ArticleCard article={article} />
                  </Col>
                ))}
              </Row>
            </section>
          )
        })}
      </QueryState>
    </>
  )
}
