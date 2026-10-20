import { existsSync } from 'node:fs'
import path from 'node:path'
import { ipcMain, shell } from 'electron'
import { IPC } from './channels'

/** 只允许打开 http(s) / mailto 链接，防止页面借机调用本地协议 */
export function isSafeExternalUrl(url: string): boolean {
  try {
    return ['http:', 'https:', 'mailto:'].includes(new URL(url).protocol)
  }
  catch {
    return false
  }
}

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC.openExternal, async (_event, url: unknown) => {
    if (typeof url !== 'string' || !isSafeExternalUrl(url))
      throw new Error('不支持打开该链接')
    await shell.openExternal(url)
  })

  // 用系统文件管理器打开目录（如数据目录、工具链目录）
  ipcMain.handle(IPC.openPath, async (_event, target: unknown) => {
    if (typeof target !== 'string' || !path.isAbsolute(target) || !existsSync(target))
      return '路径不存在'
    return shell.openPath(target)
  })
}
