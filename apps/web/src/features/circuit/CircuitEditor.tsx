import type { CircuitDoc } from '@mcu/shared'
import type { DragEvent, ReactNode } from 'react'
import type { PartSimState } from './parts/types'
import type { CircuitInteraction } from './simContext'
import {
  Background,
  ConnectionLineType,
  ConnectionMode,
  Controls,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import { App } from 'antd'
import { useCallback, useMemo, useRef } from 'react'
import { useSettings } from '../../stores/settings'
import { downloadText, pickTextFile } from '../../utils/download'
import { checkCircuit } from '../simulator/circuitCheck'
import { isCircuitDoc } from './circuitOps'
import { EditorToolbar } from './EditorToolbar'
import { exportCircuitPng } from './exportImage'
import { NODE_TYPES } from './nodeTypes'
import { PartPalette } from './PartPalette'
import { PART_DRAG_TYPE } from './parts/constants'
import { PropertyPanel } from './PropertyPanel'
import { CircuitInteractionContext } from './simContext'
import { useCircuitFlow } from './useCircuitFlow'
import '@xyflow/react/dist/style.css'
import './circuit.css'

export interface CircuitEditorProps {
  /** 初始电路（非受控）；需要整体替换时请修改 key */
  defaultValue: CircuitDoc
  onChange?: (doc: CircuitDoc) => void
  /** 仿真状态：LED 亮度、舵机角度等 */
  sim?: Record<string, PartSimState>
  running?: boolean
  onPressButton?: (partId: string, pressed: boolean) => void
  /** side：左侧常驻元件库；popover：工具栏弹出（窄空间用） */
  paletteMode?: 'side' | 'popover'
  toolbarExtra?: ReactNode
  /** 导出文件名（不含扩展名） */
  fileName?: string
}

const SNAP_GRID: [number, number] = [8, 8]
const DELETE_KEYS = ['Backspace', 'Delete']
const EMPTY_SIM: Record<string, PartSimState> = {}
function noop() {}

function CircuitEditorInner(props: CircuitEditorProps) {
  const { defaultValue, onChange, sim = EMPTY_SIM, running = false, onPressButton = noop, paletteMode = 'side', toolbarExtra, fileName = 'circuit' } = props
  const { message } = App.useApp()
  const theme = useSettings(state => state.theme)
  const canvasRef = useRef<HTMLDivElement>(null)
  const flow = useCircuitFlow(defaultValue, onChange)
  const { addPartAtScreen, setPartProps, replaceDoc } = flow
  const issues = useMemo(() => checkCircuit(flow.doc), [flow.doc])

  const interaction = useMemo<CircuitInteraction>(
    () => ({ editable: true, running, sim, pressButton: onPressButton, setPartProps }),
    [onPressButton, running, setPartProps, sim],
  )

  /** 点击元件库：放到画布中央 */
  const addAtCenter = useCallback((type: string) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect)
      addPartAtScreen(type, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 })
  }, [addPartAtScreen])

  const onDragOver = (event: DragEvent) => {
    if (event.dataTransfer.types.includes(PART_DRAG_TYPE)) {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
    }
  }

  const onDrop = (event: DragEvent) => {
    const type = event.dataTransfer.getData(PART_DRAG_TYPE)
    if (!type)
      return
    event.preventDefault()
    addPartAtScreen(type, { x: event.clientX, y: event.clientY })
  }

  const exportPng = () => {
    if (!canvasRef.current)
      return
    exportCircuitPng(canvasRef.current, flow.nodes, `${fileName}.png`)
      .catch((error: Error) => void message.error(error.message))
  }

  const exportJson = () => downloadText(JSON.stringify(flow.doc, null, 2), `${fileName}.circuit.json`)

  const importJson = async () => {
    const text = await pickTextFile('.json,application/json')
    if (text === null)
      return
    try {
      const parsed: unknown = JSON.parse(text)
      if (!isCircuitDoc(parsed))
        throw new Error('不是有效的电路文件')
      replaceDoc(parsed)
      void message.success('已导入电路')
    }
    catch (error) {
      void message.error((error as Error).message)
    }
  }

  const palette = <PartPalette onAdd={addAtCenter} />

  return (
    <CircuitInteractionContext value={interaction}>
      <div className="circuit-editor">
        {paletteMode === 'side' && <aside className="circuit-palette">{palette}</aside>}
        <div className="circuit-canvas" ref={canvasRef} onDragOver={onDragOver} onDrop={onDrop}>
          <ReactFlow
            nodes={flow.nodes}
            edges={flow.edges}
            nodeTypes={NODE_TYPES}
            onNodesChange={flow.onNodesChange}
            onEdgesChange={flow.onEdgesChange}
            onConnect={flow.onConnect}
            connectionMode={ConnectionMode.Loose}
            connectionLineType={ConnectionLineType.SmoothStep}
            colorMode={theme}
            snapToGrid
            snapGrid={SNAP_GRID}
            deleteKeyCode={DELETE_KEYS}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            minZoom={0.2}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={16} />
            <Controls showInteractive={false} />
            {paletteMode === 'side' && <MiniMap pannable zoomable />}
            <Panel position="top-left">
              <EditorToolbar
                palette={paletteMode === 'popover' ? palette : undefined}
                hasSelection={flow.hasSelection}
                issues={issues}
                extra={toolbarExtra}
                onDelete={flow.deleteSelected}
                onFit={flow.fit}
                onExportPng={exportPng}
                onExportJson={exportJson}
                onImportJson={() => void importJson()}
              />
            </Panel>
            {flow.hasSelection && (
              <Panel position="top-right">
                <PropertyPanel
                  node={flow.selectedNode}
                  edge={flow.selectedEdge}
                  onPartProps={setPartProps}
                  onPartChange={flow.updatePart}
                  onEdgeColor={flow.setEdgeColor}
                  onDelete={flow.deleteSelected}
                  onClose={flow.clearSelection}
                />
              </Panel>
            )}
          </ReactFlow>
        </div>
      </div>
    </CircuitInteractionContext>
  )
}

/**
 * 可编辑电路图：拖放元件、拖动引脚连线、改属性、旋转、导入导出、电路检查。
 * 传入 sim / running 后可在编辑器里直接交互仿真（按键、电位器）。
 */
export function CircuitEditor(props: CircuitEditorProps) {
  return (
    <ReactFlowProvider>
      <CircuitEditorInner {...props} />
    </ReactFlowProvider>
  )
}
