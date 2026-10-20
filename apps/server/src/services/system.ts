import type { SerialPermission, SystemInfo } from '@mcu/shared'
import type { AppOptions } from '../config'
import { execFileSync } from 'node:child_process'
import os from 'node:os'
import process from 'node:process'
import { normalizeArch, normalizeOs } from '@mcu/shared'

/**
 * Linux 下访问 /dev/ttyUSB* 需要 dialout（Debian/Ubuntu）或 uucp（Arch）组权限。
 * 其他系统无需额外权限。
 */
export function checkSerialPermission(): SerialPermission {
  if (process.platform !== 'linux')
    return { ok: true, message: '当前系统无需额外的串口权限配置' }
  if (process.getuid?.() === 0)
    return { ok: true, message: '以 root 运行，拥有串口权限' }

  try {
    const groups = execFileSync('id', ['-Gn'], { encoding: 'utf8' }).trim().split(/\s+/)
    if (groups.includes('dialout') || groups.includes('uucp'))
      return { ok: true, message: '当前用户已在 dialout/uucp 组中' }
    return {
      ok: false,
      message: '当前用户不在 dialout 组，可能无法打开串口。请执行 sudo usermod -aG dialout $USER 后注销并重新登录',
    }
  }
  catch {
    return { ok: true, message: '无法检测用户组，已跳过' }
  }
}

export function getSystemInfo(options: AppOptions): SystemInfo {
  return {
    os: normalizeOs(process.platform),
    arch: normalizeArch(process.arch),
    osRelease: `${os.type()} ${os.release()}`,
    nodeVersion: process.versions.node,
    runtime: options.runtime ?? 'node',
    electronVersion: options.electronVersion,
    appVersion: options.appVersion ?? '0.1.0',
    dataDir: options.dataDir,
    serialPermission: checkSerialPermission(),
  }
}
