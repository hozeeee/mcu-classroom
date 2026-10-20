import type { BoardCore } from './types/board'

/** arduino-cli 支持的芯片核心（编译工具链） */
export const BOARD_CORES: BoardCore[] = [
  {
    id: 'arduino:avr',
    name: 'Arduino AVR Boards',
    sizeHint: '约 150 MB',
    description: 'Arduino Uno / Nano / Mega 等 ATmega 系列，入门首选',
  },
  {
    id: 'esp32:esp32',
    name: 'ESP32 Arduino (Espressif)',
    indexUrl: 'https://espressif.github.io/arduino-esp32/package_esp32_index.json',
    sizeHint: '约 1.5 GB',
    description: 'ESP32 / ESP32-S3 / ESP32-C3 等，带 WiFi 与蓝牙，物联网首选',
  },
  {
    id: 'STMicroelectronics:stm32',
    name: 'STM32 Arduino (STM32duino)',
    indexUrl: 'https://github.com/stm32duino/BoardManagerFiles/raw/main/package_stmicroelectronics_index.json',
    sizeHint: '约 1 GB',
    description: 'STM32F1/F4 等 ARM Cortex-M 芯片，烧录需额外安装 STM32CubeProgrammer',
  },
  {
    id: 'rp2040:rp2040',
    name: 'Raspberry Pi Pico (arduino-pico)',
    indexUrl: 'https://github.com/earlephilhower/arduino-pico/releases/download/global/package_rp2040_index.json',
    sizeHint: '约 400 MB',
    description: 'RP2040 / RP2350，双核 Cortex-M0+，支持 UF2 拖拽烧录',
  },
]

export function getCore(id: string): BoardCore | undefined {
  return BOARD_CORES.find(core => core.id === id)
}

export function getCoreIndexUrls(): string[] {
  return BOARD_CORES.flatMap(core => (core.indexUrl ? [core.indexUrl] : []))
}
