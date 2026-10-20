import { CodeOutlined } from '@ant-design/icons'
import { getBoard } from '@mcu/shared'
import { App, Breadcrumb, Button, Card, Col, Flex, List, Row, Tabs, Tag, Typography } from 'antd'
import { Link, useNavigate, useParams } from 'react-router'
import { DifficultyTag } from '../../components/DifficultyTag'
import { CodeBlock } from '../../components/markdown/CodeBlock'
import { MarkdownView } from '../../components/markdown/MarkdownView'
import { NotesPanel } from '../../components/NotesPanel'
import { ProgressToggle } from '../../components/ProgressToggle'
import { QueryState } from '../../components/QueryState'
import { useArticleIndex, useExample } from '../../queries/content'
import { useCreateFromExample } from '../../queries/projects'
import { ProjectMaterials } from './ProjectMaterials'
import { ProjectWiring } from './ProjectWiring'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const { data: project, isLoading, error, refetch } = useExample(id)
  const articles = useArticleIndex()
  const createFromExample = useCreateFromExample()
  const board = project ? getBoard(project.boardId) : undefined

  const openInWorkbench = async () => {
    if (!project)
      return
    const created = await createFromExample.mutateAsync(project.id)
    void message.success('已复制到「我的项目」，可以随意修改')
    navigate(`/workbench?project=${created.id}`)
  }

  return (
    <QueryState loading={isLoading} error={error} onRetry={refetch}>
      {project && (
        <Row gutter={24} style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Col xs={24} xl={17}>
            <Breadcrumb style={{ marginBottom: 12 }} items={[{ title: <Link to="/projects">实战项目</Link> }, { title: project.title }]} />
            <Card style={{ marginBottom: 16 }}>
              <Flex justify="space-between" align="flex-start" wrap gap={16}>
                <div>
                  <Typography.Title level={2} style={{ marginTop: 0 }}>{project.title}</Typography.Title>
                  <Typography.Paragraph type="secondary">{project.summary}</Typography.Paragraph>
                  <Flex wrap gap={6}>
                    <DifficultyTag value={project.difficulty} />
                    {board && <Tag color="blue">{board.name}</Tag>}
                    {board?.simulatable && <Tag color="green">支持浏览器仿真</Tag>}
                    {project.tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
                  </Flex>
                </div>
                <Flex vertical gap={12} align="flex-end">
                  <Button type="primary" size="large" icon={<CodeOutlined />} loading={createFromExample.isPending} onClick={openInWorkbench}>
                    在工作台打开
                  </Button>
                  <ProgressToggle type="project" id={project.id} />
                </Flex>
              </Flex>
            </Card>
            <Card>
              <Tabs
                items={[
                  { key: 'guide', label: '项目讲解', children: <MarkdownView source={project.guide} /> },
                  { key: 'wiring', label: '接线图', children: <ProjectWiring project={project} /> },
                  { key: 'materials', label: `物料清单 (${project.materials.length})`, children: <ProjectMaterials project={project} /> },
                  { key: 'code', label: '程序代码', children: <CodeBlock code={project.code} lang="cpp" /> },
                ]}
              />
            </Card>
          </Col>
          <Col xs={24} xl={7}>
            <Flex vertical gap={16} style={{ position: 'sticky', top: 80 }}>
              {project.articles.length > 0 && (
                <Card size="small" title="前置知识">
                  <List
                    size="small"
                    dataSource={project.articles}
                    renderItem={(slug) => {
                      const meta = articles.get(slug)
                      return (
                        <List.Item>
                          {meta ? <Link to={`/library/${meta.category}/${meta.slug}`}>{meta.title}</Link> : slug}
                        </List.Item>
                      )
                    }}
                  />
                </Card>
              )}
              {board && (
                <Card size="small" title="烧录提示">
                  <Typography.Paragraph style={{ margin: 0 }}>{board.uploadHint}</Typography.Paragraph>
                </Card>
              )}
              <NotesPanel noteRef={`project:${project.id}`} defaultTitle={project.title} />
            </Flex>
          </Col>
        </Row>
      )}
    </QueryState>
  )
}
