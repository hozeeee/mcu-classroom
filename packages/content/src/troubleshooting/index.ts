import type { TroubleshootItem } from '@mcu/shared'
import { CONNECTION_ISSUES } from './connection'
import { HARDWARE_ISSUES } from './hardware'
import { PROGRAM_ISSUES } from './program'

export const TROUBLESHOOT_CATEGORIES: { id: TroubleshootItem['category'], name: string }[] = [
  { id: 'driver', name: '驱动与端口' },
  { id: 'upload', name: '烧录失败' },
  { id: 'compile', name: '编译错误' },
  { id: 'serial', name: '串口通信' },
  { id: 'circuit', name: '电路问题' },
  { id: 'power', name: '供电问题' },
  { id: 'simulator', name: '仿真器' },
]

export const TROUBLESHOOTING: TroubleshootItem[] = [
  ...CONNECTION_ISSUES,
  ...PROGRAM_ISSUES,
  ...HARDWARE_ISSUES,
]
