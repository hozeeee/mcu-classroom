import net from 'node:net'
import path from 'node:path'
import process from 'node:process'
import { createApp, defaultDataDir } from '@mcu/server'
import { DEFAULT_SERVER_PORT } from '@mcu/shared'
import { app } from 'electron'
import { resolveResourceDirs } from './paths'

const HOST = '127.0.0.1'

export interface EmbeddedServer {
  url: string
  port: number
  dataDir: string
  close: () => Promise<void>
}

function isPortFree(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const probe = net.createServer()
    probe.once('error', () => resolve(false))
    probe.once('listening', () => probe.close(() => resolve(true)))
    probe.listen(port, HOST)
  })
}

/** 优先使用默认端口（开发时 Vite 代理指向它），被占用时交给系统分配 */
async function pickPort(): Promise<number> {
  const preferred = Number.parseInt(process.env.MCU_PORT ?? '', 10) || DEFAULT_SERVER_PORT
  return (await isPortFree(preferred)) ? preferred : 0
}

/**
 * 在主进程内启动后端：与网页版共用同一个数据目录（~/.mcu-classroom），
 * 这样网页版装好的工具链、保存的项目在桌面端也能直接用。
 */
export async function startEmbeddedServer(): Promise<EmbeddedServer> {
  const { webDir, articlesDir } = resolveResourceDirs()
  const dataDir = process.env.MCU_DATA_DIR ? path.resolve(process.env.MCU_DATA_DIR) : defaultDataDir()

  const server = await createApp({
    dataDir,
    articlesDir,
    webDir,
    runtime: 'electron',
    electronVersion: process.versions.electron,
    appVersion: app.getVersion(),
    logger: !app.isPackaged,
  })
  await server.listen({ host: HOST, port: await pickPort() })

  const address = server.server.address()
  const port = typeof address === 'object' && address ? address.port : DEFAULT_SERVER_PORT
  return {
    url: `http://${HOST}:${port}`,
    port,
    dataDir,
    close: () => server.close(),
  }
}
