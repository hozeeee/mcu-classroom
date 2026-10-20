import type { Note } from '@mcu/shared'
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Empty, Flex, Input, Popconfirm, Row, Tag, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { MarkdownView } from '../../components/markdown/MarkdownView'
import { PageHeader } from '../../components/PageHeader'
import { QueryState } from '../../components/QueryState'
import { useArticleIndex } from '../../queries/content'
import { useDeleteNote, useNotes } from '../../queries/notes'
import { NoteEditorModal } from './NoteEditorModal'

function NoteRefLink({ noteRef }: { noteRef: string }) {
  const articles = useArticleIndex()
  const [type, id = ''] = noteRef.split(':')
  if (type === 'article') {
    const meta = articles.get(id)
    return meta ? <Link to={`/library/${meta.category}/${meta.slug}`}><Tag color="blue">{`文章 · ${meta.title}`}</Tag></Link> : <Tag>{noteRef}</Tag>
  }
  if (type === 'project')
    return <Link to={`/projects/${id}`}><Tag color="purple">{`项目 · ${id}`}</Tag></Link>
  return <Tag>{noteRef}</Tag>
}

export default function NotesPage() {
  const { data = [], isLoading, error, refetch } = useNotes()
  const deleteNote = useDeleteNote()
  const [keyword, setKeyword] = useState('')
  const [editing, setEditing] = useState<{ open: boolean, note?: Note }>({ open: false })

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase()
    return q ? data.filter(note => note.title.toLowerCase().includes(q) || note.content.toLowerCase().includes(q)) : data
  }, [data, keyword])

  return (
    <>
      <PageHeader
        title="学习笔记"
        description="随手记录疑问、心得和踩过的坑。在文章和项目页记录的笔记也会汇总到这里。"
        extra={(
          <Flex gap={12}>
            <Input.Search allowClear placeholder="搜索笔记" value={keyword} onChange={e => setKeyword(e.target.value)} style={{ width: 220 }} />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setEditing({ open: true })}>新建笔记</Button>
          </Flex>
        )}
      />
      <QueryState loading={isLoading} error={error} onRetry={refetch}>
        {filtered.length === 0
          ? <Empty description="还没有笔记" />
          : (
              <Row gutter={[16, 16]}>
                {filtered.map(note => (
                  <Col key={note.id} xs={24} lg={12} xxl={8}>
                    <Card
                      size="small"
                      title={note.title}
                      extra={(
                        <Flex>
                          <Button type="text" size="small" icon={<EditOutlined />} onClick={() => setEditing({ open: true, note })} />
                          <Popconfirm title="删除这条笔记？" onConfirm={() => deleteNote.mutate(note.id)}>
                            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                          </Popconfirm>
                        </Flex>
                      )}
                    >
                      <div style={{ maxHeight: 220, overflow: 'auto' }}>
                        <MarkdownView source={note.content} />
                      </div>
                      <Flex justify="space-between" align="center" style={{ marginTop: 8 }}>
                        {note.ref ? <NoteRefLink noteRef={note.ref} /> : <span />}
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>{new Date(note.updatedAt).toLocaleString()}</Typography.Text>
                      </Flex>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
      </QueryState>
      <NoteEditorModal open={editing.open} note={editing.note} onClose={() => setEditing({ open: false })} />
    </>
  )
}
