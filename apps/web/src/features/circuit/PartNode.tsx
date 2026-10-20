import type { NodeProps } from '@xyflow/react'
import type { PartNodeType } from './convert'
import { Handle } from '@xyflow/react'
import { layoutPins, normalizeRotation, rotatedSize, rotationTransform } from './geometry'
import { getPartDefinition } from './parts/registry'
import { useCircuitInteraction } from './simContext'

/** React Flow 自定义节点：绘制元件外观，并把每个引脚渲染成可连线的 Handle */
export function PartNode({ data, selected }: NodeProps<PartNodeType>) {
  const { part } = data
  const { sim, editable, running, setPartProps } = useCircuitInteraction()
  const definition = getPartDefinition(part.type)

  if (!definition) {
    return (
      <div className="circuit-part unknown">
        未知元件：
        {part.type}
      </div>
    )
  }

  const rotation = normalizeRotation(part.rotation)
  const size = rotatedSize(definition.width, definition.height, rotation)
  const pins = layoutPins(definition.pins, definition.width, definition.height, rotation)
  const slider = definition.fields?.find(field => field.type === 'slider')
  const showSlider = slider && (running || (editable && selected))

  return (
    <div className={`circuit-part${selected ? ' selected' : ''}`} style={{ width: size.width, height: size.height }}>
      <div
        style={{
          width: definition.width,
          height: definition.height,
          transform: rotationTransform(definition.width, definition.height, rotation),
          transformOrigin: '0 0',
        }}
      >
        <definition.Visual part={part} definition={definition} sim={sim[part.id]} />
      </div>
      {pins.map(pin => (
        <Handle
          key={pin.id}
          id={pin.id}
          type="source"
          position={pin.position}
          isConnectable={editable}
          className="circuit-pin"
          title={`${definition.name} · ${pin.label}`}
          style={{ left: pin.x, top: pin.y, right: 'auto', bottom: 'auto' }}
        />
      ))}
      {showSlider && (
        <div className="circuit-part-slider nodrag nopan">
          <input
            type="range"
            min={slider.min ?? 0}
            max={slider.max ?? 100}
            value={Number(part.props?.[slider.key] ?? definition.defaultProps?.[slider.key] ?? 0)}
            onChange={event => setPartProps(part.id, { [slider.key]: Number(event.target.value) })}
          />
          <span>{slider.label}</span>
        </div>
      )}
    </div>
  )
}
