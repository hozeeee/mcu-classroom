---
title: 程序烧录原理
summary: 编译出的固件是怎么进入芯片的？Bootloader、ISP、SWD、UF2、DFU 各种烧录方式一次讲透。
difficulty: intermediate
minutes: 18
tags: [烧录, Bootloader, ISP, SWD, UF2, avrdude, esptool]
order: 6
---

## 烧录是什么

**烧录（Flash / Upload / Download / 下载）** 就是把编译生成的机器码写入单片机内部的 Flash 存储器。断电后程序依然保存，上电后自动运行。

类比前端：编译 = `vite build`，烧录 = 把 `dist/` 部署到服务器。

## 固件文件格式

| 格式 | 说明 | 平台 |
| --- | --- | --- |
| `.hex` | Intel HEX，文本格式，带地址和校验 | AVR、STM32 |
| `.bin` | 纯二进制，需另行指定写入地址 | ESP32、STM32 |
| `.elf` | 带调试符号的可执行文件，调试器使用 | 所有 |
| `.uf2` | USB Flashing Format，可拖拽到 U 盘 | RP2040 |

本站仿真器直接加载 `.hex` 文件到虚拟 ATmega328P 的 Flash 中运行。

## 烧录方式一览

### 1. 串口 + Bootloader（Arduino AVR）

```
电脑 avrdude ──USB──► CH340 ──UART──► ATmega328P [Bootloader] ──写──► Flash
                         │
                         └── DTR 信号 → 复位芯片，进入 Bootloader
```

- 优点：只需一根 USB 线。
- 缺点：Bootloader 占用 0.5KB Flash；Bootloader 损坏后需要 ISP 重刷。

### 2. ISP（AVR 在系统编程）

通过 SPI 接口（MOSI、MISO、SCK、RESET）直接写 Flash，不需要 Bootloader。工具：USBasp，或者用 **另一块 Arduino 刷 ArduinoISP 程序** 当编程器。用于烧录 Bootloader、给裸芯片烧程序。

### 3. ROM 下载模式（ESP32）

芯片内部 ROM 固化了下载程序，永不损坏：

```
esptool ──USB──► CP2102 ──UART──► ESP32 (GPIO0=LOW 时复位进入下载模式)
```

### 4. SWD（STM32 等 ARM 芯片）

ARM 标准调试接口，两根线（SWDIO、SWCLK），配合 ST-Link / J-Link / DAPLink：

- 直接读写 Flash 和内存。
- 同时支持 **在线调试**（断点、单步）。

### 5. UF2（RP2040）

芯片 ROM 模拟出一个 U 盘，把 `.uf2` 文件拷进去即完成烧录。

### 6. DFU（USB Device Firmware Upgrade）

USB 标准协议，STM32 的部分型号、ESP32-S2/S3 支持。

### 7. OTA（Over The Air）

ESP32 等无线芯片通过 WiFi 下载新固件并写入备用分区，下次启动切换。

## 本站的烧录流程

点击工作台的 **烧录** 按钮后：

1. 如果对应串口正在被串口监视器占用，后端先关闭它。
2. 后端调用 `arduino-cli upload -p <端口> --fqbn <开发板> --input-dir <编译产物目录>`。
3. arduino-cli 根据开发板自动选择底层工具：

| 开发板 | 底层工具 | 方式 |
| --- | --- | --- |
| Uno / Nano | avrdude | 串口 + Bootloader |
| ESP32 | esptool | ROM 下载模式 |
| Blue Pill | STM32CubeProgrammer | SWD（ST-Link） |
| Pico | picotool / UF2 复制 | UF2 |

4. 烧录日志实时显示在工作台的输出面板。

## 熔丝位（AVR）

AVR 芯片还有 **熔丝位（Fuse）**，配置时钟源、Bootloader 大小、复位引脚等。错误的熔丝设置可能让芯片"变砖"（例如选择了不存在的外部时钟），需要高压编程器才能恢复。**初学阶段不要修改熔丝位。**

## 读出保护

量产产品通常会开启 **读保护**，防止固件被他人读出。STM32 的 RDP、ESP32 的 Flash 加密都是这种机制。
