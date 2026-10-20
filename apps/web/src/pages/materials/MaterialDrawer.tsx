import type { Material } from '@mcu/shared'
import { WarningOutlined } from '@ant-design/icons'
import { Alert, Descriptions, Drawer, Flex, Table, Tag, Typography } from 'antd'
import { MarkdownView } from '../../components/markdown/MarkdownView'

interface MaterialDrawerProps {
  material?: Material
  onClose: () => void
}

export function MaterialDrawer({ material, onClose }: MaterialDrawerProps) {
  return (
    <Drawer
      open={Boolean(material)}
      onClose={onClose}
      size={560}
      title={material && (
        <Flex align="center" gap={8}>
          <span style={{ fontSize: 24 }}>{material.icon}</span>
          {material.name}
          {material.essential && <Tag color="gold">入门必备</Tag>}
        </Flex>
      )}
    >
      {material && (
        <Flex vertical gap={20}>
          <Typography.Paragraph style={{ margin: 0 }}>{material.summary}</Typography.Paragraph>

          <Descriptions title="主要参数" size="small" column={1} bordered items={Object.entries(material.specs).map(([label, value]) => ({ key: label, label, children: value }))} />

          <div>
            <Typography.Title level={5}>怎么用</Typography.Title>
            <MarkdownView source={material.usage} />
          </div>

          {material.pins && material.pins.length > 0 && (
            <div>
              <Typography.Title level={5}>引脚说明</Typography.Title>
              <Table
                size="small"
                pagination={false}
                rowKey="name"
                dataSource={material.pins}
                columns={[
                  { title: '引脚', dataIndex: 'name', width: 120 },
                  { title: '说明', dataIndex: 'desc' },
                ]}
              />
            </div>
          )}

          {material.cautions && material.cautions.length > 0 && (
            <Alert
              type="warning"
              icon={<WarningOutlined />}
              showIcon
              title="注意事项"
              description={<ul style={{ margin: 0, paddingLeft: 18 }}>{material.cautions.map(item => <li key={item}>{item}</li>)}</ul>}
            />
          )}

          <Descriptions
            title="采购建议"
            size="small"
            column={1}
            items={[
              { key: 'price', label: '参考价', children: material.price },
              { key: 'tips', label: '选购', children: material.buyTips },
            ]}
          />
        </Flex>
      )}
    </Drawer>
  )
}
