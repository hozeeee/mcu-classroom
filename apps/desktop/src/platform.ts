import type { CpuArch, OsPlatform } from '@mcu/shared'
import os from 'node:os'
import process from 'node:process'
import { normalizeArch, normalizeOs } from '@mcu/shared'

export interface DesktopPlatform {
  os: OsPlatform
  arch: CpuArch
  isMac: boolean
  isWindows: boolean
  isLinux: boolean
  /** Apple Silicon 上通过 Rosetta 运行 x64 版本 */
  isRosetta: boolean
  release: string
}

/**
 * 主进程平台检测：决定窗口样式、菜单结构、生命周期行为等。
 * 与前端、后端共用 @mcu/shared 的 normalizeOs / normalizeArch，保证三端口径一致。
 */
export function detectDesktopPlatform(): DesktopPlatform {
  const current = normalizeOs(process.platform)
  return {
    os: current,
    arch: normalizeArch(process.arch),
    isMac: current === 'macos',
    isWindows: current === 'windows',
    isLinux: current === 'linux',
    isRosetta: current === 'macos' && process.arch === 'x64' && os.cpus().some(cpu => /apple/i.test(cpu.model)),
    release: os.release(),
  }
}

export const desktopPlatform = detectDesktopPlatform()
