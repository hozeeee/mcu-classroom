import type { ExampleProject } from '@mcu/shared'
import { Table } from 'antd'
import { Link } from 'react-router'
import { useMaterials } from '../../queries/content'

export function ProjectMaterials({ project }: { project: ExampleProject }) {
  const { data: materials = [] } = useMaterials()
  const rows = project.materials.map((item) => {
    const material = materials.find(m => m.id === item.materialId)
    return { ...item, material }
  })

  return (
    <Table
      size="small"
      rowKey="materialId"
      pagination={false}
      dataSource={rows}
      columns={[
        {
          title: '物料',
          key: 'name',
          render: (_, row) => row.material
            ? <Link to={`/materials?category=${row.material.category}&id=${row.material.id}`}>{`${row.material.icon} ${row.material.name}`}</Link>
            : row.materialId,
        },
        { title: '数量', dataIndex: 'quantity', width: 80 },
        { title: '说明', dataIndex: 'note', render: (note?: string) => note ?? '-' },
        { title: '参考价', key: 'price', width: 120, render: (_, row) => row.material?.price ?? '-' },
      ]}
    />
  )
}
