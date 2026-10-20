import { Breadcrumb, Card, Col, Divider, Flex, Row, Tag, Typography } from 'antd'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { DifficultyTag } from '../../components/DifficultyTag'
import { MarkdownView } from '../../components/markdown/MarkdownView'
import { ProgressToggle } from '../../components/ProgressToggle'
import { QueryState } from '../../components/QueryState'
import { useArticle, useCategories } from '../../queries/content'
import { ArticlePager } from './ArticlePager'
import { ArticleSidebar } from './ArticleSidebar'
import { AskAiButton } from './AskAiButton'

export default function ArticlePage() {
  const { category = '', slug = '' } = useParams()
  const { data: article, isLoading, error, refetch } = useArticle(category, slug)
  const { data: categories } = useCategories()
  const categoryName = categories?.articles.find(item => item.id === category)?.name ?? category

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  return (
    <QueryState loading={isLoading} error={error} onRetry={refetch}>
      {article && (
        <Row gutter={24} style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Col xs={24} xl={17}>
            <Breadcrumb
              style={{ marginBottom: 12 }}
              items={[{ title: <Link to="/library">知识库</Link> }, { title: categoryName }, { title: article.title }]}
            />
            <Card>
              <Typography.Title level={2} style={{ marginTop: 0 }}>{article.title}</Typography.Title>
              <Typography.Paragraph type="secondary">{article.summary}</Typography.Paragraph>
              <Flex justify="space-between" align="center" wrap gap={12}>
                <Flex wrap gap={6}>
                  <DifficultyTag value={article.difficulty} />
                  <Tag>{`约 ${article.minutes} 分钟`}</Tag>
                  {article.tags.map(tag => <Tag key={tag} color="geekblue">{tag}</Tag>)}
                </Flex>
                <Flex wrap gap={8} align="center">
                  <AskAiButton article={article} categoryName={categoryName} />
                  <ProgressToggle type="article" id={article.slug} />
                </Flex>
              </Flex>
              <Divider />
              <MarkdownView source={article.body} />
              <Divider />
              <Flex justify="center" align="center" wrap gap={8}>
                <AskAiButton article={article} categoryName={categoryName} />
                <ProgressToggle type="article" id={article.slug} />
              </Flex>
              <ArticlePager article={article} />
            </Card>
          </Col>
          <Col xs={24} xl={7}>
            <ArticleSidebar article={article} />
          </Col>
        </Row>
      )}
    </QueryState>
  )
}
