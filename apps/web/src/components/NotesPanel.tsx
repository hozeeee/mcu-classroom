import type { Note } from '@mcu/shared'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { App, Button, Card, Empty, Flex, Input, List, Popconfirm, Typography } from 'antd'
import { useState } from 'react'
import { useCreateNote, useDeleteNote, useNotes, useUpdateNote } from '../queries/notes'

interface NotesPanelProps {
  /** 关联对象，如 article:ohms-law */
  noteRef: string
  defaultTitle: string
}

function NoteItem({ note }: { note: Note }) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(note.content)
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()

  if (editing) {
    return (
      <List.Item>
        <Flex vertical gap={8} style={{ width: '100%' }}>
          <Input.TextArea value={content} onChange={e => setContent(e.target.value)} autoSize={{ minRows: 3 }} />
          <Flex gap={8} justify="flex-end">
            <Button size="small" onClick={() => setEditing(false)}>取消</Button>
            <Button
              size="small"
              type="primary"
              loading={updateNote.isPending}
              onClick={() => updateNote.mutate({ id: note.id, patch: { content } }, { onSuccess: () => setEditing(false) })}
            >
              保存
            </Button>
          </Flex>
        </Flex>
      </List.Item>
    )
  }

  return (
    <List.Item
      actions={[
        <Button key="edit" size="small" type="text" icon={<EditOutlined />} onClick={() => setEditing(true)} />,
        <Popconfirm key="delete" title="删除这条笔记？" onConfirm={() => deleteNote.mutate(note.id)}>
          <Button size="small" type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>,
      ]}
    >
      <List.Item.Meta
        description={new Date(note.updatedAt).toLocaleString()}
        title={<Typography.Paragraph style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{note.content}</Typography.Paragraph>}
      />
    </List.Item>
  )
}

/** 文章 / 项目页侧边的随手笔记 */
export function NotesPanel({ noteRef, defaultTitle }: NotesPanelProps) {
  const { message } = App.useApp()
  const { data = [] } = useNotes(noteRef)
  const createNote = useCreateNote()
  const [draft, setDraft] = useState('')

  const submit = () => {
    if (!draft.trim())
      return
    createNote.mutate({ title: defaultTitle, content: draft.trim(), ref: noteRef }, {
      onSuccess: () => {
        setDraft('')
        void message.success('笔记已保存')
      },
    })
  }

  return (
    <Card size="small" title="我的笔记">
      <Input.TextArea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder="记下疑问、心得或踩过的坑（Ctrl + Enter 保存）"
        autoSize={{ minRows: 3, maxRows: 8 }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey))
            submit()
        }}
      />
      <Flex justify="flex-end" style={{ marginTop: 8 }}>
        <Button type="primary" size="small" onClick={submit} loading={createNote.isPending} disabled={!draft.trim()}>
          保存笔记
        </Button>
      </Flex>
      {data.length === 0
        ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="还没有笔记" />
        : <List size="small" dataSource={data} renderItem={note => <NoteItem key={note.id} note={note} />} />}
    </Card>
  )
}
