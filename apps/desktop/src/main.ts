import type { BrowserWindow } from 'electron'
import type { EmbeddedServer } from './server'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { app, dialog, Menu } from 'electron'
import { resolveDevUrl } from './devServer'
import { registerIpcHandlers } from './ipc'
import { buildAppMenu } from './menu'
import { resolveResourceDirs } from './paths'
import { desktopPlatform } from './platform'
import { startEmbeddedServer } from './server'
import { createMainWindow } from './window'

const APP_ID = 'com.hozeeee.mcu-classroom'

let mainWindow: BrowserWindow | null = null
let server: EmbeddedServer | null = null
let appUrl = ''

function openWindow(): void {
  mainWindow = createMainWindow(appUrl)
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function focusWindow(): void {
  if (!mainWindow)
    return
  if (mainWindow.isMinimized())
    mainWindow.restore()
  mainWindow.focus()
}

/** 计算页面地址：开发时优先 Vite（热更新），否则使用内置后端托管的前端构建产物 */
async function resolveAppUrl(serverUrl: string): Promise<string> {
  const devUrl = await resolveDevUrl()
  if (devUrl)
    return devUrl
  const { webDir } = resolveResourceDirs()
  if (!existsSync(path.join(webDir, 'index.html')))
    throw new Error(`找不到前端构建产物：${webDir}\n请先执行 pnpm build，或同时运行 pnpm dev:web。`)
  return serverUrl
}

async function bootstrap(): Promise<void> {
  registerIpcHandlers()
  server = await startEmbeddedServer()
  appUrl = await resolveAppUrl(server.url)
  Menu.setApplicationMenu(buildAppMenu({ dataDir: server.dataDir, serverUrl: server.url }))
  openWindow()
}

// 同一时间只允许运行一个实例：工具链安装、串口占用都不能并发
if (!app.requestSingleInstanceLock()) {
  app.quit()
}
else {
  // Windows 通知、任务栏分组依赖 AppUserModelId
  if (desktopPlatform.isWindows)
    app.setAppUserModelId(APP_ID)

  app.on('second-instance', focusWindow)

  app.whenReady()
    .then(bootstrap)
    .catch((error: unknown) => {
      dialog.showErrorBox('MCU Classroom 启动失败', error instanceof Error ? error.message : String(error))
      app.quit()
    })

  // macOS：点击 Dock 图标且没有窗口时重新打开
  app.on('activate', () => {
    if (!mainWindow && appUrl)
      openWindow()
  })

  // macOS 习惯关闭窗口后应用仍驻留 Dock，其它系统直接退出
  app.on('window-all-closed', () => {
    if (!desktopPlatform.isMac)
      app.quit()
  })

  // 退出前关闭后端，释放串口与正在运行的子进程
  app.on('will-quit', (event) => {
    if (!server)
      return
    event.preventDefault()
    const closing = server
    server = null
    void closing.close().finally(() => app.quit())
  })
}
