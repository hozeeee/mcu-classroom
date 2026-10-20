---
title: 树莓派 Pico 入门
summary: RP2040 / RP2350 型号怎么读、Pico 各版本区别、UF2 拖拽烧录、双核编程、PIO 可编程 IO，以及 MicroPython 选项。
difficulty: intermediate
minutes: 22
tags: [Pico, RP2040, RP2350, Pico W, Pico 2, 选型, UF2, 双核, PIO, MicroPython]
order: 5
---

## RP2040 / Pico 概览

| 项目 | 参数 |
| --- | --- |
| CPU | 双核 ARM Cortex-M0+，133MHz（可超频到 200MHz+） |
| SRAM | 264KB |
| Flash | 2MB（外置 QSPI） |
| GPIO | 26 个可用（GP0 ~ GP22, GP26 ~ GP28） |
| ADC | 3 通道 12 位（GP26 ~ GP28）+ 内部温度传感器 |
| PWM | 16 路 |
| 通信 | 2×UART、2×SPI、2×I2C、USB 1.1 |
| 特色 | **PIO**：8 个可编程 IO 状态机 |
| 电压 | 3.3V |

**Pico W** 增加了 WiFi 与蓝牙（CYW43439），**Pico 2** 升级为 RP2350（Cortex-M33 / RISC-V 双架构）。

## 型号怎么读

RP2040 的名字本身就是一张参数表（官方定义，见《RP2040 Datasheet》第 1 章）：

```
RP 2 0 4 0
│  │ │ │ └ 片上 Flash：0 = 芯片内没有 Flash（所以 Pico 板上另外焊了一颗 2MB Flash）
│  │ │ └── 片上 RAM：floor(log2(RAM / 16KB))，264KB → 4
│  │ └──── 内核类型：0 = Cortex-M0+
│  └────── 核心数量：2
└───────── Raspberry Pi
```

按同样的规则读 **RP2350**：2 核、**3 = Cortex-M33**（还可切换为 RISC-V 核）、**5 = 520KB RAM**、芯片内无 Flash。它还分两种封装：

| 型号 | 封装 | GPIO | 芯片内 Flash |
| --- | --- | --- | --- |
| RP2350A | QFN-60 | 30 | 无 |
| RP2350B | QFN-80 | 48 | 无 |
| RP2354A / RP2354B | 同上 | 30 / 48 | **2MB**（末位 4 表示内置 Flash） |

### Pico 各版本

| 开发板 | 芯片 | 区别 |
| --- | --- | --- |
| Pico | RP2040 | 基础款（本站内置） |
| Pico **H** | RP2040 | 焊好排针 + 3 针调试接口，电路与 Pico 相同 |
| Pico **W** / WH | RP2040 + CYW43439 | 增加 WiFi 4 + 蓝牙；板载 LED 改接到无线芯片上 |
| Pico **2** | RP2350A | 150MHz、520KB RAM、4MB Flash，增加安全启动等特性，引脚与 Pico 兼容 |
| Pico 2 W | RP2350A + CYW43439 | Pico 2 + 无线 |
| 第三方板（RP2040-Zero、YD-RP2040 等） | RP2040 | 尺寸、Flash 容量、USB 接口不同，**引脚定义要看各自的图** |

怎么选：学习、跟本站教程选 **Pico / Pico H**；需要联网选 **Pico W**；新项目需要更快、更大内存选 **Pico 2**。不同版本在 Arduino 中要选对应开发板（如 Pico W 的 FQBN 是 `rp2040:rp2040:rpipicow`），否则 WiFi 和板载 LED 都无法使用。

## UF2 拖拽烧录

Pico 的烧录方式对新手非常友好：

1. **按住 BOOTSEL 按键** 再插入 USB。
2. 电脑上出现一个名为 **RPI-RP2** 的 U 盘。
3. 把 `.uf2` 固件文件拖进去，Pico 自动重启运行。

本站使用 arduino-pico 核心，点击"烧录"时 arduino-cli 会自动完成复制。第一次烧录后，之后通常不需要再按 BOOTSEL（核心会通过 USB 串口自动重启进入下载模式）。

> UF2 的芯片 ROM 引导程序是 **固化** 的，所以 Pico 永远"烧不坏"——程序再怎么出错，按住 BOOTSEL 上电都能救回来。

## 引脚

```circuit
pico-blink
```

- 板载 LED：GP25（Pico）/ `LED_BUILTIN`（Pico W）
- 默认 I2C0：GP4（SDA）、GP5（SCL）
- 默认 UART0：GP0（TX）、GP1（RX）
- 默认 SPI0：GP16 ~ GP19
- 大部分功能都可以重映射到其他引脚。

## 双核编程

arduino-pico 核心中，`setup1()` / `loop1()` 会自动运行在第二个核心上：

```cpp
void setup()  { /* 核心 0 */ }
void loop()   { /* 核心 0 */ }
void setup1() { /* 核心 1 */ }
void loop1()  { /* 核心 1 */ }
```

两个核心共享内存，可通过 `rp2040.fifo.push()` / `pop()` 安全地传递数据。

## PIO：可编程 IO

PIO 是 RP2040 最独特的功能：用简单的汇编指令编写 **独立运行的 IO 状态机**，可以实现硬件不直接支持的协议（WS2812、VGA 输出、额外的 UART/I2S 等），完全不占用 CPU。属于进阶内容，感兴趣可以阅读官方《RP2040 Datasheet》第 3 章。

## 三种开发方式

| 方式 | 说明 |
| --- | --- |
| **Arduino**（本站） | arduino-pico 核心（Earle Philhower），兼容性好，库多 |
| **C/C++ SDK** | 官方 pico-sdk + CMake，最完整的功能 |
| **MicroPython / CircuitPython** | 烧录 Python 解释器固件后，用 Thonny 直接写 Python，适合快速原型 |

MicroPython 示例：

```python
from machine import Pin
import time

led = Pin(25, Pin.OUT)
while True:
    led.toggle()
    time.sleep(0.5)
```

> 用 MicroPython 后再用本站烧录 Arduino 程序会覆盖 Python 固件，反之亦然。
