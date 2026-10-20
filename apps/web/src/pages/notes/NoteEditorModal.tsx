import type { Note } from '@mcu/shared'
import { Form, Input, Modal, Tabs } from 'antd'
import { useEffect } from 'react'
import { MarkdownView } from '../../components/markdown/MarkdownView'
import { useCreateNote, useUpdateNote } from '../../queries/notes'

interface NoteEditorModalProps {
  open: boolean
  /** 不传则为新建 */
  note?: Note
  onClose: () => void
}

interface FormValues {
  title: string
  content: string
}

export function NoteEditorModal({ open, note, onClose }: NoteEditorModalProps) {
  const [form] = Form.useForm<FormValues>()
  const createNote = useCreateNote()
  const updateNote = useUpdateNote()
  const preview = Form.useWatch('content', form) ?? ''

  useEffect(() => {
    if (open)
      form.setFieldsValue({ title: note?.title ?? '', content: note?.content ?? '' })
  }, [open, note, form])

  const submit = async () => {
    const values = await form.validateFields()
    if (note)
      await updateNote.mutateAsync({ id: note.id, patch: values })
    else
      await createNote.mutateAsync(values)
    onClose()
  }

  return (
    <Modal
      title={note ? '编辑笔记' : '新建笔记'}
      open={open}
      width={760}
      onCancel={onClose}
      onOk={submit}
      confirmLoading={createNote.isPending || updateNote.isPending}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
          <Input maxLength={100} />
        </Form.Item>
        <Tabs
          items={[
            {
              key: 'edit',
              label: '编辑（支持 Markdown）',
              forceRender: true,
              children: (
                <Form.Item name="content" rules={[{ required: true, message: '请输入内容' }]}>
                  <Input.TextArea autoSize={{ minRows: 10, maxRows: 20 }} />
                </Form.Item>
              ),
            },
            { key: 'preview', label: '预览', children: <MarkdownView source={preview || '*（空）*'} /> },
          ]}
        />
      </Form>
    </Modal>
  )
}
