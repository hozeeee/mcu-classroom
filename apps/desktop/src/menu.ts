import type { MenuItemConstructorOptions } from 'electron'
import { app, Menu, shell } from 'electron'
import { desktopPlatform } from './platform'

const REPO_URL = 'https://github.com/hozeeee/mcu-classroom'

interface MenuContext {
  dataDir: string
  serverUrl: string
}

function helpMenu(ctx: MenuContext): MenuItemConstructorOptions {
  return {
    role: 'help',
    label: '帮助',
    submenu: [
      { label: '打开数据目录', click: () => void shell.openPath(ctx.dataDir) },
      { label: '在浏览器中打开', click: () => void shell.openExternal(ctx.serverUrl) },
      { type: 'separator' },
      { label: '项目主页', click: () => void shell.openExternal(REPO_URL) },
      { label: '反馈问题', click: () => void shell.openExternal(`${REPO_URL}/issues`) },
    ],
  }
}

/**
 * 应用菜单按平台区分：
 * - macOS：第一个菜单固定为应用名菜单（关于 / 隐藏 / 退出），并保留“窗口”菜单
 * - Windows / Linux：“文件”菜单里放退出，菜单栏默认自动隐藏（按 Alt 显示）
 */
export function buildAppMenu(ctx: MenuContext): Menu {
  const template: MenuItemConstructorOptions[] = []

  if (desktopPlatform.isMac) {
    template.push({
      label: app.name,
      submenu: [
        { role: 'about', label: '关于 MCU Classroom' },
        { type: 'separator' },
        { role: 'services', label: '服务' },
        { type: 'separator' },
        { role: 'hide', label: '隐藏' },
        { role: 'hideOthers', label: '隐藏其他' },
        { role: 'unhide', label: '全部显示' },
        { type: 'separator' },
        { role: 'quit', label: '退出' },
      ],
    })
  }
  else {
    template.push({ label: '文件', submenu: [{ role: 'quit', label: '退出' }] })
  }

  template.push(
    { role: 'editMenu', label: '编辑' },
    {
      label: '视图',
      submenu: [
        { role: 'reload', label: '重新加载' },
        { role: 'forceReload', label: '强制重新加载' },
        { role: 'toggleDevTools', label: '开发者工具' },
        { type: 'separator' },
        { role: 'resetZoom', label: '实际大小' },
        { role: 'zoomIn', label: '放大' },
        { role: 'zoomOut', label: '缩小' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: '全屏' },
      ],
    },
    desktopPlatform.isMac
      ? { role: 'windowMenu', label: '窗口' }
      : { label: '窗口', submenu: [{ role: 'minimize', label: '最小化' }, { role: 'close', label: '关闭' }] },
    helpMenu(ctx),
  )

  return Menu.buildFromTemplate(template)
}
