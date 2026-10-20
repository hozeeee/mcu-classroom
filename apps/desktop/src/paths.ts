import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { app } from 'electron'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '../../..')

/**
 * 资源目录：
 * - 打包后：electron-builder 通过 extraResources 放到 resources/ 下
 * - 开发时：直接使用仓库里的前端构建产物和文章目录
 */
export function resolveResourceDirs(): { webDir: string, articlesDir: string } {
  if (app.isPackaged) {
    return {
      webDir: path.join(process.resourcesPath, 'web'),
      articlesDir: path.join(process.resourcesPath, 'articles'),
    }
  }
  return {
    webDir: path.join(repoRoot, 'apps/web/dist'),
    articlesDir: path.join(repoRoot, 'packages/content/articles'),
  }
}

export const preloadPath = path.join(here, 'preload.cjs')
