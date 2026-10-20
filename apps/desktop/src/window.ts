import type { BrowserWindowConstructorOptions } from 'electron'
import { app, BrowserWindow, shell } from 'electron'
import { APP_VERSION_ARG } from './channels'
import { isSafeExternalUrl } from './ipc'
import { preloadPath } from './paths'
import { desktopPlatform } from './platform'

/**
 * 不同系统的窗口外观：
 * - macOS：隐藏标题栏、红绿灯嵌入页面顶栏（页面会据此留出左侧空间并设置拖拽区域）
 * - Windows / Linux：保留系统标题栏，菜单栏自动隐藏
 */
function platformWindowOptions(): BrowserWindowConstructorOptions {
  if (desktopPlatform.isMac)
    return { titleBarStyle: 'hiddenInset', trafficLightPosition: { x: 16, y: 20 } }
  return { autoHideMenuBar: true }
}

/** 页面只能停留在应用自身的地址，其它链接一律交给系统浏览器 */
function guardNavigation(win: BrowserWindow, appOrigin: string): void {
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isSafeExternalUrl(url))
      void shell.openExternal(url)
    return { action: 'deny' }
  })
  win.webContents.on('will-navigate', (event, url) => {
    if (new URL(url).origin === appOrigin)
      return
    event.preventDefault()
    if (isSafeExternalUrl(url))
      void shell.openExternal(url)
  })
}

export function createMainWindow(url: string): BrowserWindow {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    title: 'MCU Classroom',
    backgroundColor: '#f5f7fa',
    ...platformWindowOptions(),
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: false,
      additionalArguments: [`${APP_VERSION_ARG}${app.getVersion()}`],
    },
  })

  guardNavigation(win, new URL(url).origin)
  win.once('ready-to-show', () => win.show())
  void win.loadURL(url)
  return win
}
