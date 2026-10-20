import type { CpuArch, OsPlatform } from '@mcu/shared'
import { normalizeArch, normalizeOs } from '@mcu/shared'

/** Electron 预加载脚本注入的桥接对象（见 apps/desktop/src/preload.ts） */
export interface DesktopBridge {
  isDesktop: true
  platform: string
  arch: string
  appVersion: string
  versions: { electron: string, chrome: string, node: string }
  openExternal: (url: string) => Promise<void>
  openPath: (path: string) => Promise<string>
}

declare global {
  interface Window {
    mcuDesktop?: DesktopBridge
  }
}

export interface ClientPlatform {
  os: OsPlatform
  arch: CpuArch
  isDesktop: boolean
  desktop?: DesktopBridge
}

interface UADataLike {
  platform?: string
}

/**
 * 前端平台检测：
 * - 桌面端：直接读取 Electron 提供的 process.platform，最准确
 * - 浏览器：优先 navigator.userAgentData.platform，回退到 navigator.platform / userAgent
 */
export function detectPlatform(): ClientPlatform {
  const desktop = typeof window !== 'undefined' ? window.mcuDesktop : undefined
  if (desktop?.isDesktop) {
    return {
      os: normalizeOs(desktop.platform),
      arch: normalizeArch(desktop.arch),
      isDesktop: true,
      desktop,
    }
  }
  const nav = navigator as Navigator & { userAgentData?: UADataLike }
  const raw = nav.userAgentData?.platform || nav.platform || nav.userAgent
  const arch = /arm|aarch64/i.test(nav.userAgent) ? 'arm64' : 'x64'
  return { os: normalizeOs(raw), arch: normalizeArch(arch), isDesktop: false }
}

export const platform = detectPlatform()

/** 打开外部链接：桌面端交给系统浏览器，网页端新标签页 */
export function openExternal(url: string): void {
  if (platform.desktop)
    void platform.desktop.openExternal(url)
  else
    window.open(url, '_blank', 'noopener,noreferrer')
}
