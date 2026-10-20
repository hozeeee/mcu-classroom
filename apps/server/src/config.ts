import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { DEFAULT_SERVER_PORT } from '@mcu/shared'

export interface AppOptions {
  /** SQLite、工具链、临时工程等数据存放目录 */
  dataDir: string
  /** Markdown 文章目录 */
  articlesDir: string
  /** 前端构建产物目录，存在时由后端托管（生产 / 桌面端） */
  webDir?: string
  /** 运行环境，桌面端传入 electron */
  runtime?: 'node' | 'electron'
  electronVersion?: string
  appVersion?: string
  /** 是否输出请求日志 */
  logger?: boolean
}

export interface ListenOptions {
  host: string
  port: number
}

export function defaultDataDir(): string {
  return path.join(os.homedir(), '.mcu-classroom')
}

/** 从环境变量读取监听配置 */
export function resolveListenOptions(env: NodeJS.ProcessEnv = process.env): ListenOptions {
  const port = Number.parseInt(env.MCU_PORT ?? '', 10)
  return {
    host: env.MCU_HOST || '127.0.0.1',
    port: Number.isFinite(port) ? port : DEFAULT_SERVER_PORT,
  }
}
