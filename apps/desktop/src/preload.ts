/* eslint-disable node/prefer-global/process -- sandbox 预加载脚本只能用全局 process，无法 require('node:process') */
import { contextBridge, ipcRenderer } from 'electron'
import { APP_VERSION_ARG, IPC } from './channels'

/**
 * 预加载脚本：向页面暴露最小化的桌面能力，类型定义见 apps/web/src/platform/index.ts。
 * 页面通过 window.mcuDesktop 是否存在来判断当前是否运行在桌面端。
 */
const appVersion = process.argv.find(arg => arg.startsWith(APP_VERSION_ARG))?.slice(APP_VERSION_ARG.length) ?? ''

contextBridge.exposeInMainWorld('mcuDesktop', {
  isDesktop: true,
  platform: process.platform,
  arch: process.arch,
  appVersion,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
  openExternal: (url: string): Promise<void> => ipcRenderer.invoke(IPC.openExternal, url),
  openPath: (target: string): Promise<string> => ipcRenderer.invoke(IPC.openPath, target),
})
