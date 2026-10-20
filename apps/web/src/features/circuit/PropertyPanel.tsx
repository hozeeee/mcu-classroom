import type { CircuitPart } from '@mcu/shared'
import type { PartNodeType, WireEdgeType } from './convert'
import type { PropField } from './parts/types'
import { CloseOutlined, DeleteOutlined, RotateLeftOutlined, RotateRightOutlined } from '@ant-design/icons'
import { BOARDS } from '@mcu/shared'
import { Button, Card, Flex, Form, InputNumber, Select, Slider, Space, Typography } from 'antd'
import { BOARD_PART_PREFIX, isBoardPart } from './parts/boards'
import { WIRE_COLORS } from './parts/constants'
import { getPartDefinition } from './parts/registry'

type PartProps = NonNullable<CircuitPart['props']>

interface PropertyPanelProps {
  node?: PartNodeType
  edge?: WireEdgeType
  onPartProps: (partId: string, patch: PartProps) => void
  onPartChange: (partId: string, patch: Partial<CircuitPart>) => void
  onEdgeColor: (edgeId: string, color: string) => void
  onDelete: () => void
  onClose: () => void
}

function FieldInput({ field, value, onChange }: { field: PropField, value: unknown, onChange: (value: string | number) => void }) {
  switch (field.type) {
    case 'select':
      return <Select size="small" value={value as string} options={field.options} onChange={onChange} />
    case 'slider':
      return <Slider min={field.min} max={field.max} step={field.step} value={Number(value ?? 0)} onChange={onChange} />
    default:
      return (
        <InputNumber
          size="small"
          style={{ width: '100%' }}
          min={field.min}
          max={field.max}
          step={field.step}
          suffix={field.unit}
          value={Number(value ?? 0)}
          onChange={next => next !== null && onChange(next)}
        />
      )
  }
}

/** 选中元件 / 导线后的属性面板 */
export function PropertyPanel({ node, edge, onPartProps, onPartChange, onEdgeColor, onDelete, onClose }: PropertyPanelProps) {
  const close = <Button size="small" type="text" icon={<CloseOutlined />} onClick={onClose} />
  const remove = <Button size="small" danger icon={<DeleteOutlined />} onClick={onDelete}>删除</Button>

  if (edge) {
    return (
      <Card size="small" className="circuit-property-panel" title="导线" extra={close}>
        <Typography.Paragraph type="secondary" style={{ fontSize: 12 }}>
          {`${edge.source}.${edge.sourceHandle} → ${edge.target}.${edge.targetHandle}`}
        </Typography.Paragraph>
        <Typography.Text style={{ fontSize: 12 }}>颜色（红=电源，黑=地）</Typography.Text>
        <Flex wrap gap={6} style={{ margin: '6px 0 12px' }}>
          {WIRE_COLORS.map(color => (
            <button
              key={color}
              type="button"
              aria-label={color}
              onClick={() => onEdgeColor(edge.id, color)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 4,
                background: color,
                cursor: 'pointer',
                border: edge.data?.color === color ? '2px solid #0f9d8a' : '1px solid rgba(0,0,0,.2)',
              }}
            />
          ))}
        </Flex>
        {remove}
      </Card>
    )
  }

  if (!node)
    return null
  const { part } = node.data
  const definition = getPartDefinition(part.type)
  const rotate = (delta: number) => onPartChange(part.id, { rotation: ((part.rotation ?? 0) + delta + 360) % 360 })

  return (
    <Card size="small" className="circuit-property-panel" title={`${definition?.name ?? part.type}（${part.id}）`} extra={close}>
      {definition && <Typography.Paragraph type="secondary" style={{ fontSize: 12 }}>{definition.description}</Typography.Paragraph>}
      <Form layout="vertical" size="small">
        {isBoardPart(part.type) && (
          <Form.Item label="开发板型号">
            <Select
              value={part.type.slice(BOARD_PART_PREFIX.length)}
              options={BOARDS.map(board => ({ value: board.id, label: board.name }))}
              onChange={boardId => onPartChange(part.id, { type: `${BOARD_PART_PREFIX}${boardId}` })}
            />
          </Form.Item>
        )}
        {definition?.fields?.map(field => (
          <Form.Item key={field.key} label={field.unit ? `${field.label}（${field.unit}）` : field.label}>
            <FieldInput
              field={field}
              value={part.props?.[field.key] ?? definition.defaultProps?.[field.key]}
              onChange={value => onPartProps(part.id, { [field.key]: value })}
            />
          </Form.Item>
        ))}
      </Form>
      <Space>
        <Button size="small" icon={<RotateLeftOutlined />} onClick={() => rotate(-90)} />
        <Button size="small" icon={<RotateRightOutlined />} onClick={() => rotate(90)} />
        {remove}
      </Space>
    </Card>
  )
}
