import { BOARDS, DEFAULT_BOARD_ID } from '@mcu/shared'
import { Form, Input, Modal, Select } from 'antd'
import { useNavigate } from 'react-router'
import { useCreateProject } from '../../queries/projects'

interface NewProjectModalProps {
  open: boolean
  onClose: () => void
}

interface FormValues {
  name: string
  boardId: string
}

export function NewProjectModal({ open, onClose }: NewProjectModalProps) {
  const navigate = useNavigate()
  const [form] = Form.useForm<FormValues>()
  const createProject = useCreateProject()

  const submit = async () => {
    const values = await form.validateFields()
    const project = await createProject.mutateAsync(values)
    onClose()
    form.resetFields()
    navigate(`/workbench?project=${project.id}`)
  }

  return (
    <Modal title="新建项目" open={open} onCancel={onClose} onOk={submit} confirmLoading={createProject.isPending} okText="创建并打开">
      <Form form={form} layout="vertical" initialValues={{ boardId: DEFAULT_BOARD_ID }}>
        <Form.Item name="name" label="项目名称" rules={[{ required: true, message: '请输入项目名称' }]}>
          <Input placeholder="例如：我的第一个 LED" maxLength={60} />
        </Form.Item>
        <Form.Item name="boardId" label="开发板" extra="只有 Arduino Uno 支持浏览器内仿真，其他板子需连接实物烧录">
          <Select options={BOARDS.map(board => ({ value: board.id, label: board.name }))} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
