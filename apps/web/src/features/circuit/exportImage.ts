import type { Node } from '@xyflow/react'
import { getNodesBounds, getViewportForBounds } from '@xyflow/react'
import { toPng } from 'html-to-image'
import { downloadUrl } from '../../utils/download'

const PADDING = 40

/** 把画布中的电路导出为 PNG（参考 React Flow 官方 download-image 示例） */
export async function exportCircuitPng(container: HTMLElement, nodes: Node[], fileName: string): Promise<void> {
  const viewportElement = container.querySelector<HTMLElement>('.react-flow__viewport')
  if (!viewportElement || !nodes.length)
    throw new Error('画布为空，无法导出')
  const bounds = getNodesBounds(nodes)
  const width = Math.ceil(bounds.width + PADDING * 2)
  const height = Math.ceil(bounds.height + PADDING * 2)
  const viewport = getViewportForBounds(bounds, width, height, 1, 1, 0)
  const background = getComputedStyle(document.documentElement).getPropertyValue('--app-panel').trim() || '#ffffff'
  const dataUrl = await toPng(viewportElement, {
    backgroundColor: background,
    width,
    height,
    pixelRatio: 2,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
    },
  })
  downloadUrl(dataUrl, fileName)
}
