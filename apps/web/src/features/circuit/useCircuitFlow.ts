import type { CircuitDoc, CircuitPart } from '@mcu/shared'
import type { Connection, XYPosition } from '@xyflow/react'
import type { PartNodeType, WireEdgeType } from './convert'
import { addEdge, useEdgesState, useNodesState, useReactFlow, useUpdateNodeInternals } from '@xyflow/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { circuitToFlow, flowToCircuit, guessWireColor, nextId, partIdPrefix, partToNode, wireEdgeStyle } from './convert'
import { getPartDefinition } from './parts/registry'

type PartProps = NonNullable<CircuitPart['props']>

const FIT_OPTIONS = { padding: 0.15 }

/**
 * 电路编辑器的状态与操作（非受控）：
 * 初始值来自 defaultValue，内部变化通过 onChange 通知；外部要整体替换电路时请修改组件 key
 */
export function useCircuitFlow(defaultValue: CircuitDoc, onChange?: (doc: CircuitDoc) => void) {
  const [initial] = useState(() => circuitToFlow(defaultValue))
  const [nodes, setNodes, onNodesChange] = useNodesState<PartNodeType>(initial.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<WireEdgeType>(initial.edges)
  const { screenToFlowPosition, deleteElements, fitView } = useReactFlow<PartNodeType, WireEdgeType>()
  const updateNodeInternals = useUpdateNodeInternals()

  const doc = useMemo(() => flowToCircuit(nodes, edges), [nodes, edges])
  const dragging = nodes.some(node => node.dragging)
  const lastJsonRef = useRef(JSON.stringify(flowToCircuit(initial.nodes, initial.edges)))
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  })

  // 拖拽过程中不通知，松手后再通知一次；选中状态变化不会改变 JSON，因此不会触发
  useEffect(() => {
    if (dragging)
      return
    const json = JSON.stringify(doc)
    if (json === lastJsonRef.current)
      return
    lastJsonRef.current = json
    onChangeRef.current?.(doc)
  }, [doc, dragging])

  const refreshNode = useCallback((partId: string) => {
    requestAnimationFrame(() => updateNodeInternals(partId))
  }, [updateNodeInternals])

  /** 添加元件；position 为元件中心点（流坐标） */
  const addPart = useCallback((type: string, position: XYPosition) => {
    const definition = getPartDefinition(type)
    if (!definition)
      return
    setNodes((current) => {
      const part: CircuitPart = {
        id: nextId(partIdPrefix(type), current.map(node => node.id)),
        type,
        x: Math.round(position.x - definition.width / 2),
        y: Math.round(position.y - definition.height / 2),
        ...(definition.defaultProps ? { props: { ...definition.defaultProps } } : {}),
      }
      return [
        ...current.map(node => (node.selected ? { ...node, selected: false } : node)),
        { ...partToNode(part), selected: true },
      ]
    })
  }, [setNodes])

  /** 按屏幕坐标添加元件（拖放、点击元件库时用） */
  const addPartAtScreen = useCallback((type: string, screen: XYPosition) => {
    addPart(type, screenToFlowPosition(screen))
  }, [addPart, screenToFlowPosition])

  const mapPart = useCallback((partId: string, update: (part: CircuitPart) => CircuitPart) => {
    setNodes(current => current.map(node => (
      node.id === partId ? { ...node, data: { ...node.data, part: update(node.data.part) } } : node
    )))
  }, [setNodes])

  const updatePart = useCallback((partId: string, patch: Partial<CircuitPart>) => {
    mapPart(partId, part => ({ ...part, ...patch }))
    if (patch.type) {
      // 换型号后，新元件上不存在的引脚对应的导线需要删除
      const pins = new Set(getPartDefinition(patch.type)?.pins.map(pin => pin.id))
      const valid = (part: string, pin?: string | null) => part !== partId || pins.has(pin ?? '')
      setEdges(current => current.filter(edge => valid(edge.source, edge.sourceHandle) && valid(edge.target, edge.targetHandle)))
    }
    if (patch.type || patch.rotation !== undefined)
      refreshNode(partId)
  }, [mapPart, refreshNode, setEdges])

  const setPartProps = useCallback((partId: string, patch: PartProps) => {
    mapPart(partId, part => ({ ...part, props: { ...part.props, ...patch } }))
  }, [mapPart])

  const onConnect = useCallback((connection: Connection) => {
    if (connection.source === connection.target && connection.sourceHandle === connection.targetHandle)
      return
    setEdges((current) => {
      const color = guessWireColor(connection.sourceHandle, connection.targetHandle)
      const edge: WireEdgeType = {
        ...connection,
        id: nextId('w', current.map(item => item.id)),
        type: 'smoothstep',
        style: wireEdgeStyle(color),
        data: { color },
      }
      return addEdge(edge, current)
    })
  }, [setEdges])

  const setEdgeColor = useCallback((edgeId: string, color: string) => {
    setEdges(current => current.map(edge => (
      edge.id === edgeId ? { ...edge, style: wireEdgeStyle(color), data: { color } } : edge
    )))
  }, [setEdges])

  const deleteSelected = useCallback(() => {
    void deleteElements({
      nodes: nodes.filter(node => node.selected),
      edges: edges.filter(edge => edge.selected),
    })
  }, [deleteElements, edges, nodes])

  const clearSelection = useCallback(() => {
    setNodes(current => current.map(node => (node.selected ? { ...node, selected: false } : node)))
    setEdges(current => current.map(edge => (edge.selected ? { ...edge, selected: false } : edge)))
  }, [setEdges, setNodes])

  const fit = useCallback(() => {
    void fitView(FIT_OPTIONS)
  }, [fitView])

  const replaceDoc = useCallback((next: CircuitDoc) => {
    const flow = circuitToFlow(next)
    setNodes(flow.nodes)
    setEdges(flow.edges)
    requestAnimationFrame(() => void fitView(FIT_OPTIONS))
  }, [fitView, setEdges, setNodes])

  const selectedNode = nodes.find(node => node.selected)
  const selectedEdge = selectedNode ? undefined : edges.find(edge => edge.selected)

  return {
    nodes,
    edges,
    doc,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addPartAtScreen,
    updatePart,
    setPartProps,
    setEdgeColor,
    deleteSelected,
    clearSelection,
    fit,
    replaceDoc,
    selectedNode,
    selectedEdge,
    hasSelection: Boolean(selectedNode || selectedEdge),
  }
}
