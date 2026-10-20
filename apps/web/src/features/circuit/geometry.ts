import type { PinDef } from './parts/types'
import { Position } from '@xyflow/react'

export type Rotation = 0 | 90 | 180 | 270

export function normalizeRotation(value: number | undefined): Rotation {
  const deg = (((Math.round((value ?? 0) / 90) * 90) % 360) + 360) % 360
  return deg as Rotation
}

/** 旋转后的外框尺寸 */
export function rotatedSize(width: number, height: number, rotation: Rotation) {
  return rotation === 90 || rotation === 270 ? { width: height, height: width } : { width, height }
}

/** 顺时针旋转后引脚在外框中的坐标 */
export function rotatePoint(x: number, y: number, width: number, height: number, rotation: Rotation) {
  switch (rotation) {
    case 90: return { x: height - y, y: x }
    case 180: return { x: width - x, y: height - y }
    case 270: return { x: y, y: width - x }
    default: return { x, y }
  }
}

/** 内层 SVG 的 CSS 变换，使其与 rotatePoint 结果一致 */
export function rotationTransform(width: number, height: number, rotation: Rotation): string | undefined {
  switch (rotation) {
    case 90: return `translate(${height}px, 0) rotate(90deg)`
    case 180: return `translate(${width}px, ${height}px) rotate(180deg)`
    case 270: return `translate(0, ${width}px) rotate(270deg)`
    default: return undefined
  }
}

/** 根据引脚离哪条边最近，决定导线从哪个方向引出 */
export function pinPosition(point: { x: number, y: number }, width: number, height: number): Position {
  const distances: [Position, number][] = [
    [Position.Left, point.x],
    [Position.Right, width - point.x],
    [Position.Top, point.y],
    [Position.Bottom, height - point.y],
  ]
  return distances.sort((a, b) => a[1] - b[1])[0]![0]
}

export function layoutPins(pins: PinDef[], width: number, height: number, rotation: Rotation) {
  const size = rotatedSize(width, height, rotation)
  return pins.map((pin) => {
    const point = rotatePoint(pin.x, pin.y, width, height, rotation)
    return { ...pin, ...point, position: pinPosition(point, size.width, size.height) }
  })
}
