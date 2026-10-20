---
title: 如何选择第一块开发板
summary: Arduino Uno、ESP32、STM32、树莓派 Pico 四大平台怎么选，为什么推荐从 Uno 开始。
difficulty: beginner
minutes: 12
tags: [选型, Arduino, ESP32, STM32, Pico]
order: 2
---

## 结论先行

> **第一块板子买 Arduino Uno（兼容版即可），第二块买 ESP32。** 之后按兴趣再加 STM32 或 Pico。

理由：Uno 资料最多、5V 电平容错高、本站可以在浏览器里 **仿真** Uno，学错了也不会烧东西。

## 四大平台对比

| | Arduino Uno | ESP32 DevKit | STM32 Blue Pill | 树莓派 Pico |
| --- | --- | --- | --- | --- |
| 芯片 | ATmega328P | ESP32（WROOM-32 模组） | STM32F103C8T6 | RP2040 |
| 架构 | 8 位 AVR | 32 位 Xtensa 双核 | 32 位 ARM Cortex-M3 | 32 位 ARM Cortex-M0+ 双核 |
| 主频 | 16 MHz | 240 MHz | 72 MHz | 133 MHz |
| RAM | 2 KB | 520 KB | 20 KB | 264 KB |
| Flash | 32 KB | 4 MB | 64 KB | 2 MB |
| 电平 | **5V** | 3.3V | 3.3V（部分 5V 容忍） | 3.3V |
| 无线 | 无 | **WiFi + 蓝牙** | 无 | 无（Pico W 有 WiFi） |
| 烧录 | USB 直接烧 | USB 直接烧 | 需 ST-Link 或串口 | USB 拖拽 UF2 |
| 价格 | ¥25 ~ 40 | ¥20 ~ 35 | ¥10 ~ 20 | ¥25 ~ 40 |
| 本站仿真 | ✅ | ❌ | ❌ | ❌ |
| 推荐场景 | 入门学习 | 物联网项目 | 学习底层/求职 | 性价比、MicroPython |

> 每个平台都是一个 **家族**，上表只列出了最常见的入门型号。ESP32-S3、STM32F411、Pico 2 这些"同门兄弟"有什么区别、型号怎么读，见 [看懂芯片型号](/library/start/chip-models)。

## 各平台的定位

### Arduino Uno —— 学习的起点

Arduino 是一整套生态：开发板 + 简化的 C++ 库（`digitalWrite`、`analogRead`…）+ 海量教程。Uno 是其中最经典的一块。缺点是性能弱，不能联网。

### ESP32 —— 物联网首选

自带 WiFi 和蓝牙，性能强，价格还便宜，同样可以用 Arduino 方式编程。做"手机控制灯"、"数据上传云端"选它。注意 IO 是 **3.3V**。

### STM32 —— 工业界主流

国内嵌入式岗位最常见的芯片系列。可以用 Arduino 方式入门，进阶后用 STM32CubeIDE + HAL 库，甚至直接操作寄存器。需要额外买一个 **ST-Link** 下载器（¥15 左右）。

### 树莓派 Pico —— 新晋网红

树莓派基金会自研芯片，双核、便宜、文档优秀，同时支持 C/C++、Arduino 和 **MicroPython**。烧录方式像拷贝文件一样简单。

## 购买建议

- 买 **兼容版（克隆版）** 即可，功能一样，价格是原版的 1/5。兼容版通常使用 CH340 USB 芯片，需要装驱动（见 [驱动安装](/library/practice/drivers)）。
- 优先买 **套件**，附带面包板、杜邦线、LED、电阻、按键、传感器，比单买省心。
- 不要第一次就买"超大全套 37 种传感器"，大部分用不上。

## 下一步

阅读 [看懂芯片型号](/library/start/chip-models) 学会读懂商品标题里的型号，然后看 [入门物料清单](/library/start/starter-kit)，或去 [物料库](/materials) 看看每个元件长什么样。
