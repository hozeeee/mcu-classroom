import { CodeOutlined, FileAddOutlined, FolderOpenOutlined, SaveOutlined } from '@ant-design/icons'
import { BOARDS } from '@mcu/shared'
import { Badge, Button, Dropdown, Flex, Select, Tag, Typography } from 'antd'
import { useExamples } from '../../queries/content'
import { useProjects } from '../../queries/projects'

export type CircuitSource = { type: 'draft' } | { type: 'project', id: string, name: string }

interface CircuitSourceBarProps {
  source: CircuitSource
  dirty: boolean
  saving: boolean
  onNew: (boardId: string) => void
  onOpenProject: (id: string) => void
  onOpenExample: (id: string) => void
  onSave: () => void
  onOpenWorkbench: () => void
}

/** 电路实验室顶部：新建 / 打开项目或示例 / 保存 */
export function CircuitSourceBar(props: CircuitSourceBarProps) {
  const { source, dirty, saving } = props
  const projects = useProjects()
  const examples = useExamples()

  const options = [
    {
      label: '我的项目',
      options: (projects.data ?? []).map(project => ({ value: `project:${project.id}`, label: project.name })),
    },
    {
      label: '示例项目（打开后作为草稿编辑）',
      options: (examples.data ?? []).map(example => ({ value: `example:${example.id}`, label: example.title })),
    },
  ]

  const open = (value: string) => {
    const [type, id] = value.split(':')
    if (type === 'project')
      props.onOpenProject(id)
    else
      props.onOpenExample(id)
  }

  return (
    <Flex className="circuit-lab-bar" gap={8} wrap align="center">
      <Typography.Text strong>电路实验室</Typography.Text>
      {source.type === 'project'
        ? <Tag color="green">{`项目：${source.name}`}</Tag>
        : <Tag>本地草稿（自动保存在浏览器）</Tag>}
      <Dropdown
        trigger={['click']}
        menu={{
          items: BOARDS.map(board => ({ key: board.id, label: board.name })),
          onClick: ({ key }) => props.onNew(key),
        }}
      >
        <Button size="small" icon={<FileAddOutlined />}>新建</Button>
      </Dropdown>
      <Select
        size="small"
        style={{ width: 240 }}
        value={null}
        placeholder={(
          <span>
            <FolderOpenOutlined />
            {' '}
            打开项目 / 示例
          </span>
        )}
        options={options}
        onChange={open}
        loading={projects.isLoading || examples.isLoading}
        showSearch={{ optionFilterProp: 'label' }}
      />
      {source.type === 'project' && (
        <>
          <Badge dot={dirty}>
            <Button size="small" type="primary" icon={<SaveOutlined />} loading={saving} onClick={props.onSave}>保存到项目</Button>
          </Badge>
          <Button size="small" icon={<CodeOutlined />} onClick={props.onOpenWorkbench}>去工作台写代码 / 仿真</Button>
        </>
      )}
      <Typography.Text type="secondary" style={{ fontSize: 12, marginLeft: 'auto' }}>
        拖动元件到画布，从引脚拖出导线连接；选中后按 Delete 删除
      </Typography.Text>
    </Flex>
  )
}
