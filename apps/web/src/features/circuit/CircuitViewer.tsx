import type { CircuitDoc } from '@mcu/shared'
import type { PartSimState } from './parts/types'
import type { CircuitInteraction } from './simContext'
import { Background, ConnectionMode, Controls, ReactFlow } from '@xyflow/react'
import { useMemo } from 'react'
import { useSettings } from '../../stores/settings'
import { circuitToFlow } from './convert'
import { NODE_TYPES } from './nodeTypes'
import { CircuitInteractionContext } from './simContext'
import '@xyflow/react/dist/style.css'
import './circuit.css'

interface CircuitViewerProps {
  circuit: CircuitDoc
  sim?: Record<string, PartSimState>
}

function noop() {}

/** 只读接线图：用于文章、项目详情。可平移、缩放，不可编辑 */
export function CircuitViewer({ circuit, sim }: CircuitViewerProps) {
  const theme = useSettings(state => state.theme)
  const { nodes, edges } = useMemo(() => circuitToFlow(circuit), [circuit])
  const interaction = useMemo<CircuitInteraction>(
    () => ({ editable: false, running: false, sim: sim ?? {}, pressButton: noop, setPartProps: noop }),
    [sim],
  )

  return (
    <CircuitInteractionContext value={interaction}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        connectionMode={ConnectionMode.Loose}
        colorMode={theme}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        preventScrolling={false}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.2}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </CircuitInteractionContext>
  )
}
