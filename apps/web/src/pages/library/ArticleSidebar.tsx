import type { ArticleMeta } from '@mcu/shared'
import { BuildOutlined } from '@ant-design/icons'
import { Card, List, Typography } from 'antd'
import { Link } from 'react-router'
import { DifficultyTag } from '../../components/DifficultyTag'
import { NotesPanel } from '../../components/NotesPanel'
import { useArticles, useExamples } from '../../queries/content'

/** 文章右侧栏：相关实战项目 + 同分类文章 + 笔记 */
export function ArticleSidebar({ article }: { article: ArticleMeta }) {
  const { data: articles = [] } = useArticles()
  const { data: examples = [] } = useExamples()
  const siblings = articles.filter(item => item.category === article.category)
  const related = examples.filter(item => item.articles.includes(article.slug))

  return (
    <div style={{ position: 'sticky', top: 80, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {related.length > 0 && (
        <Card
          size="small"
          title={(
            <>
              <BuildOutlined />
              {' '}
              动手练一练
            </>
          )}
        >
          <List
            size="small"
            dataSource={related}
            renderItem={item => (
              <List.Item extra={<DifficultyTag value={item.difficulty} />}>
                <Link to={`/projects/${item.id}`}>{item.title}</Link>
              </List.Item>
            )}
          />
        </Card>
      )}
      <NotesPanel noteRef={`article:${article.slug}`} defaultTitle={article.title} />
      <Card size="small" title="本分类文章">
        <List
          size="small"
          dataSource={siblings}
          renderItem={item => (
            <List.Item>
              {item.slug === article.slug
                ? <Typography.Text strong>{item.title}</Typography.Text>
                : <Link to={`/library/${item.category}/${item.slug}`}>{item.title}</Link>}
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}
