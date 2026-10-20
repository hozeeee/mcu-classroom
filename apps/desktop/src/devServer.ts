import process from 'node:process'
import { app } from 'electron'

const DEFAULT_DEV_URL = 'http://localhost:5173'

async function isReachable(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(1000) })
    return res.ok
  }
  catch {
    return false
  }
}

/**
 * 开发模式（electron . --dev）下优先加载 Vite 开发服务器（支持热更新），
 * 等待一段时间仍不可用则返回 null，回退到内置后端托管的构建产物。
 */
export async function resolveDevUrl(timeoutMs = 15_000): Promise<string | null> {
  if (app.isPackaged || !process.argv.includes('--dev'))
    return null
  const url = process.env.MCU_DESKTOP_DEV_URL || DEFAULT_DEV_URL
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await isReachable(url))
      return url
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  return null
}
