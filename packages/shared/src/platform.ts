/**
 * 平台检测工具：后端（process.platform）、Electron 主进程、前端（userAgent）共用
 */

export type OsPlatform = 'windows' | 'macos' | 'linux' | 'unknown'

export type CpuArch = 'x64' | 'arm64' | 'ia32' | 'unknown'

export const OS_LABELS: Record<OsPlatform, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  unknown: '未知系统',
}

/** 将 process.platform 或浏览器 UA 中的系统标识统一为 OsPlatform */
export function normalizeOs(raw: string | undefined | null): OsPlatform {
  const value = (raw ?? '').toLowerCase()
  if (value.startsWith('win'))
    return 'windows'
  if (value === 'darwin' || value.includes('mac'))
    return 'macos'
  if (value.includes('linux') || value.includes('x11') || value.includes('ubuntu'))
    return 'linux'
  return 'unknown'
}

export function normalizeArch(raw: string | undefined | null): CpuArch {
  const value = (raw ?? '').toLowerCase()
  if (value === 'x64' || value === 'x86_64' || value === 'amd64' || value === 'x86-64')
    return 'x64'
  if (value === 'arm64' || value === 'aarch64' || value === 'arm')
    return 'arm64'
  if (value === 'ia32' || value === 'x86' || value === 'i386' || value === 'i686')
    return 'ia32'
  return 'unknown'
}

/** 不同系统下串口设备名示例 */
export function serialPortExample(os: OsPlatform): string {
  switch (os) {
    case 'windows':
      return 'COM3'
    case 'macos':
      return '/dev/cu.usbserial-1410 或 /dev/cu.usbmodem14101'
    case 'linux':
      return '/dev/ttyUSB0 或 /dev/ttyACM0'
    default:
      return '-'
  }
}

export interface DriverHint {
  chip: string
  boards: string
  steps: string[]
  url?: string
}

/** USB 转串口驱动提示，按系统区分 */
export function getDriverHints(os: OsPlatform): DriverHint[] {
  const ch340: DriverHint = {
    chip: 'CH340 / CH341',
    boards: '绝大多数国产 Arduino Uno/Nano 兼容板、部分 ESP32 开发板',
    steps: [],
    url: 'https://www.wch.cn/downloads/CH341SER_EXE.html',
  }
  const cp210x: DriverHint = {
    chip: 'CP2102 / CP2104',
    boards: 'ESP32-DevKitC、NodeMCU 等',
    steps: [],
    url: 'https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers',
  }
  const stlink: DriverHint = {
    chip: 'ST-Link V2',
    boards: 'STM32 Blue Pill 等通过 SWD 烧录的板子',
    steps: [],
    url: 'https://www.st.com/en/development-tools/stsw-link009.html',
  }

  switch (os) {
    case 'windows':
      ch340.steps = ['下载 CH341SER.EXE 并以管理员身份安装', '插上开发板，在「设备管理器 → 端口(COM 和 LPT)」中看到 USB-SERIAL CH340 (COMx)']
      cp210x.steps = ['下载 CP210x Windows Drivers 并安装', '设备管理器中出现 Silicon Labs CP210x (COMx)']
      stlink.steps = ['安装 ST-Link 驱动（或直接安装 STM32CubeProgrammer，自带驱动）']
      return [ch340, cp210x, stlink]
    case 'macos':
      ch340.steps = ['macOS 11+ 已内置 CH34x 驱动，一般免安装', '若识别不到，安装 WCH 官方 CH34xVCPDriver 并在「系统设置 → 隐私与安全性」中允许', '设备名形如 /dev/cu.wchusbserial* 或 /dev/cu.usbserial-*']
      cp210x.steps = ['安装 Silicon Labs VCP 驱动并在「隐私与安全性」中允许系统扩展', '设备名形如 /dev/cu.SLAB_USBtoUART']
      stlink.steps = ['安装 STM32CubeProgrammer 即可，无需单独驱动']
      return [ch340, cp210x, stlink]
    case 'linux':
      ch340.steps = ['内核自带 ch341 驱动，免安装', '若被 brltty 抢占（Ubuntu 常见），执行 sudo apt remove brltty', '把当前用户加入 dialout 组：sudo usermod -aG dialout $USER，然后重新登录']
      cp210x.steps = ['内核自带 cp210x 驱动，免安装', '同样需要 dialout 组权限']
      stlink.steps = ['安装 STM32CubeProgrammer 或 stlink-tools', '配置 udev 规则后重新插拔']
      return [ch340, cp210x, stlink]
    default:
      return [ch340, cp210x, stlink]
  }
}
