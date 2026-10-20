import type { ProjectSummary } from '@mcu/shared'
import { DeleteOutlined, FolderOpenOutlined, PlusOutlined } from '@ant-design/icons'
import { getBoard } from '@mcu/shared'
import { Button, Popconfirm, Space, Table } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { QueryState } from '../../components/QueryState'
import { useDeleteProject, useProjects } from '../../queries/projects'
import { NewProjectModal } from './NewProjectModal'

/** 用户自己的项目（保存在本地 SQLite） */
export function MyProjects() {
  const navigate = useNavigate()
  const { data = [], isLoading, error, refetch } = useProjects()
  const deleteProject = useDeleteProject()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setOpen(true)}>新建空白项目</Button>
      </Space>
      <QueryState loading={isLoading} error={error} onRetry={refetch}>
        <Table<ProjectSummary>
          rowKey="id"
          dataSource={data}
          locale={{ emptyText: '还没有项目。可以新建空白项目，或在示例项目中点击「在工作台打开」复制一份。' }}
          columns={[
            { title: '名称', dataIndex: 'name' },
            { title: '开发板', dataIndex: 'boardId', render: (id: string) => getBoard(id)?.name ?? id },
            { title: '来源', dataIndex: 'exampleId', render: (id?: string | null) => (id ? `示例：${id}` : '空白项目') },
            { title: '更新时间', dataIndex: 'updatedAt', render: (value: string) => new Date(value).toLocaleString() },
            {
              title: '操作',
              key: 'actions',
              width: 180,
              render: (_, record) => (
                <Space>
                  <Button size="small" icon={<FolderOpenOutlined />} onClick={() => navigate(`/workbench?project=${record.id}`)}>打开</Button>
                  <Popconfirm title="确定删除这个项目？" onConfirm={() => deleteProject.mutate(record.id)}>
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </QueryState>
      <NewProjectModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
