/**
 * arduino-cli 的 JSON 输出在 0.x 与 1.x 之间有差异（数组 vs 包装对象、字段改名），
 * 这里统一转换为本项目的数据结构。
 */
import type { LibraryInfo, SerialPortInfo } from '@mcu/shared'

type Json = Record<string, any>

function unwrapList(data: unknown, key: string): Json[] {
  if (Array.isArray(data))
    return data
  if (data && typeof data === 'object' && Array.isArray((data as Json)[key]))
    return (data as Json)[key]
  return []
}

export interface InstalledCore {
  id: string
  installedVersion?: string
  latestVersion?: string
}

export function parseCoreList(data: unknown): InstalledCore[] {
  return unwrapList(data, 'platforms').map(item => ({
    id: String(item.id),
    installedVersion: item.installed_version ?? item.installed,
    latestVersion: item.latest_version ?? item.latest,
  }))
}

export function parseBoardList(data: unknown): SerialPortInfo[] {
  return unwrapList(data, 'detected_ports')
    .map((item) => {
      const port = item.port ?? item
      const board = (item.matching_boards ?? item.boards ?? [])[0]
      const props = port.properties ?? {}
      return {
        address: String(port.address),
        label: String(port.label ?? port.address),
        protocol: String(port.protocol ?? 'serial'),
        protocolLabel: port.protocol_label,
        boardName: board?.name,
        fqbn: board?.fqbn,
        vid: props.vid,
        pid: props.pid,
      } satisfies SerialPortInfo
    })
    .filter(port => port.protocol === 'serial')
}

export function parseLibrarySearch(data: unknown): LibraryInfo[] {
  return unwrapList(data, 'libraries').map((item) => {
    const latest = item.latest ?? {}
    return {
      name: String(item.name),
      author: latest.author,
      sentence: latest.sentence,
      latestVersion: latest.version,
    }
  })
}

export function parseLibraryList(data: unknown): LibraryInfo[] {
  return unwrapList(data, 'installed_libraries').map((item) => {
    const lib = item.library ?? item
    return {
      name: String(lib.name),
      author: lib.author,
      sentence: lib.sentence,
      installedVersion: lib.version,
    }
  })
}
