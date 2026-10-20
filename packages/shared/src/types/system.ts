import type { CpuArch, OsPlatform } from '../platform'

export interface SerialPermission {
  ok: boolean
  message: string
}

export interface SystemInfo {
  os: OsPlatform
  arch: CpuArch
  osRelease: string
  nodeVersion: string
  runtime: 'node' | 'electron'
  electronVersion?: string
  appVersion: string
  dataDir: string
  serialPermission: SerialPermission
}

export interface SerialPortInfo {
  address: string
  label: string
  protocol: string
  protocolLabel?: string
  boardName?: string
  fqbn?: string
  vid?: string
  pid?: string
}

/** 前端 → 后端：data 为要发送的文本（换行符已由前端追加） */
export type SerialClientMessage
  = | { type: 'send', data: string }

/** 后端 → 前端：data 消息中的 data 为 base64 编码的原始字节，便于 HEX 显示 */
export type SerialServerMessage
  = | { type: 'data', data: string }
    | { type: 'status', open: boolean, message: string }
    | { type: 'error', message: string }
