import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { ARTICLES_DIR } from '@mcu/content/paths'
import { createApp, defaultDataDir, resolveListenOptions } from './app'

const here = path.dirname(fileURLToPath(import.meta.url))

/** 打包后 ARTICLES_DIR 指向 dist 同级，找不到时回退到仓库内的 content 包 */
function resolveArticlesDir(): string {
  if (process.env.MCU_CONTENT_DIR)
    return process.env.MCU_CONTENT_DIR
  const candidates = [ARTICLES_DIR, path.resolve(here, '../../../packages/content/articles')]
  return candidates.find(dir => existsSync(dir)) ?? ARTICLES_DIR
}

function resolveWebDir(): string {
  return process.env.MCU_WEB_DIR || path.resolve(here, '../../web/dist')
}

async function main(): Promise<void> {
  const { host, port } = resolveListenOptions()
  const app = await createApp({
    dataDir: process.env.MCU_DATA_DIR ? path.resolve(process.env.MCU_DATA_DIR) : defaultDataDir(),
    articlesDir: resolveArticlesDir(),
    webDir: resolveWebDir(),
    logger: process.env.NODE_ENV !== 'production',
  })

  const shutdown = async () => {
    await app.close()
    process.exit(0)
  }
  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  await app.listen({ host, port })
  console.info(`MCU Classroom 后端已启动：http://${host}:${port}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
