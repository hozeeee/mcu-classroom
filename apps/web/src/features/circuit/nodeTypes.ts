import type { NodeTypes } from '@xyflow/react'
import { PartNode } from './PartNode'

/** 必须是稳定引用，否则 React Flow 每次渲染都会重建节点 */
export const NODE_TYPES: NodeTypes = { part: PartNode }
