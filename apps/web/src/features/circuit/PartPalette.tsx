import type { PartCategory, PartDefinition } from './parts/types'
import { Empty, Input, Tooltip, Typography } from 'antd'
import { useMemo, useState } from 'react'
import { PART_DRAG_TYPE } from './parts/constants'
import { PART_CATEGORY_LABELS, PART_LIBRARY } from './parts/registry'

const THUMB_WIDTH = 40
const THUMB_HEIGHT = 32

function PartThumb({ definition }: { definition: PartDefinition }) {
  const scale = Math.min(THUMB_WIDTH / definition.width, THUMB_HEIGHT / definition.height, 1)
  const preview = { id: 'preview', type: definition.type, x: 0, y: 0, props: definition.defaultProps }
  return (
    <div className="circuit-palette-thumb">
      <div style={{ width: definition.width * scale, height: definition.height * scale }}>
        <div style={{ width: definition.width, height: definition.height, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
          <definition.Visual part={preview} definition={definition} />
        </div>
      </div>
    </div>
  )
}

interface PartPaletteProps {
  onAdd: (type: string) => void
}

/** 元件库：点击添加到画布中央，或直接拖拽到画布上 */
export function PartPalette({ onAdd }: PartPaletteProps) {
  const [keyword, setKeyword] = useState('')
  const groups = useMemo(() => {
    const text = keyword.trim().toLowerCase()
    const matched = PART_LIBRARY.filter(item => !text || `${item.name}${item.type}${item.description}`.toLowerCase().includes(text))
    return (Object.keys(PART_CATEGORY_LABELS) as PartCategory[])
      .map(category => ({ category, items: matched.filter(item => item.category === category) }))
      .filter(group => group.items.length)
  }, [keyword])

  return (
    <div>
      <Input.Search size="small" allowClear placeholder="搜索元件" onChange={event => setKeyword(event.target.value)} style={{ marginBottom: 8 }} />
      {!groups.length && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="没有匹配的元件" />}
      {groups.map(group => (
        <div key={group.category} style={{ marginBottom: 8 }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>{PART_CATEGORY_LABELS[group.category]}</Typography.Text>
          {group.items.map(item => (
            <Tooltip key={item.type} title={item.description} placement="right">
              <div
                className="circuit-palette-item"
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.setData(PART_DRAG_TYPE, item.type)
                  event.dataTransfer.effectAllowed = 'move'
                }}
                onClick={() => onAdd(item.type)}
              >
                <PartThumb definition={item} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13 }}>{item.name}</div>
                  {!item.simulatable && <Typography.Text type="secondary" style={{ fontSize: 11 }}>暂不支持仿真</Typography.Text>}
                </div>
              </div>
            </Tooltip>
          ))}
        </div>
      ))}
    </div>
  )
}
