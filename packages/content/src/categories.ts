import type { ArticleCategoryInfo, MaterialCategoryInfo } from '@mcu/shared'

export const ARTICLE_CATEGORIES: ArticleCategoryInfo[] = [
  { id: 'start', name: '入门准备', description: '单片机是什么、怎么选板子、要买什么、环境怎么搭' },
  { id: 'basics', name: '电子基础', description: '电压电流电阻、常用元件、数字与模拟信号、上拉下拉' },
  { id: 'hardware', name: '电路与硬件', description: '看懂电路图、面包板接线、传感器/执行器/显示屏、电源与 PCB' },
  { id: 'programming', name: '程序编写', description: '面向 JS 开发者的 C/C++ 速成、GPIO、串口、ADC/PWM、中断、寄存器' },
  { id: 'protocols', name: '通信协议', description: 'UART、I2C、SPI 三大总线原理与实践' },
  { id: 'platforms', name: '芯片平台', description: 'Arduino AVR、ESP32、STM32、树莓派 Pico 各自的特点与上手方法' },
  { id: 'practice', name: '实操指南', description: '万用表、焊接、安全、驱动、调试方法、烧录原理' },
]

export const MATERIAL_CATEGORIES: MaterialCategoryInfo[] = [
  { id: 'board', name: '主控开发板' },
  { id: 'basic', name: '基础元件' },
  { id: 'sensor', name: '传感器' },
  { id: 'actuator', name: '执行器' },
  { id: 'display', name: '显示' },
  { id: 'module', name: '通信/功能模块' },
  { id: 'power', name: '电源' },
  { id: 'tool', name: '工具耗材' },
]
