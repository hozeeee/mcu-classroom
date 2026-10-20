---
title: 开发环境搭建
summary: 了解单片机开发的工具链：编辑器、编译器、烧录工具、串口监视器，以及本站如何一键搞定它们。
difficulty: beginner
minutes: 10
tags: [环境, arduino-cli, 工具链]
order: 5
---

## 单片机开发需要什么

类比前端：

| 前端 | 单片机 |
| --- | --- |
| VS Code | 代码编辑器（本站工作台 / Arduino IDE / VS Code） |
| TypeScript 编译器 / Vite | **交叉编译器**：avr-gcc、xtensa-esp32-elf-gcc、arm-none-eabi-gcc |
| `npm install` | 安装 **芯片核心（Core）** 与 **库（Library）** |
| 部署到服务器 | **烧录**：avrdude、esptool、STM32CubeProgrammer、picotool |
| 浏览器控制台 | **串口监视器** |

> "交叉编译"是指：在电脑（x86/ARM64）上编译出能在另一种 CPU（AVR、Xtensa、Cortex-M）上运行的机器码。

## 本站的方案：arduino-cli

[arduino-cli](https://arduino.github.io/arduino-cli/) 是 Arduino 官方的命令行工具，Arduino IDE 2 的底层就是它。它可以：

- 下载并管理各平台的编译器（通过"芯片核心"）
- 编译代码：`arduino-cli compile --fqbn arduino:avr:uno`
- 烧录：`arduino-cli upload -p COM3 --fqbn arduino:avr:uno`
- 串口监视：`arduino-cli monitor -p COM3`
- 管理第三方库：`arduino-cli lib install "DHT sensor library"`

本站后端会把 arduino-cli **下载到自己的数据目录**（默认 `~/.mcu-classroom/toolchain`），不污染你的系统环境。

## 一键安装步骤

1. 打开 [环境中心](/environment)。
2. 点击 **安装 arduino-cli**，后端会根据你的系统（Windows / macOS / Linux，x64 / ARM64）下载对应版本。
3. 按需安装芯片核心：
   - **Arduino AVR**（Uno / Nano）约 150MB，必装
   - **ESP32** 约 1GB+
   - **STM32** 约 1GB+，烧录还需要额外安装 [STM32CubeProgrammer](https://www.st.com/en/development-tools/stm32cubeprog.html)
   - **RP2040**（Pico）约 300MB
4. 根据开发板上的 USB 芯片安装驱动（页面会按你的系统给出步骤）。

> 国内下载 ESP32 核心可能很慢，可设置系统代理后重试；安装日志会实时显示在页面上。

## FQBN 是什么

**Fully Qualified Board Name**，格式为 `厂商:架构:板子[:选项]`：

- `arduino:avr:uno`
- `esp32:esp32:esp32`
- `rp2040:rp2040:rpipico`

本站的工作台会根据你选择的开发板自动填好 FQBN。

## 其他可选环境

- **Arduino IDE 2**：官方图形界面，适合离线使用。
- **PlatformIO（VS Code 插件）**：更工程化，支持上千种板子。
- **STM32CubeIDE**：STM32 官方 IDE，学 HAL 库时使用。
- **Thonny**：Pico 写 MicroPython 时使用。

本站与它们并不冲突，可以并存。
