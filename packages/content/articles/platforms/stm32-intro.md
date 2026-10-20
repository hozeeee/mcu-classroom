---
title: STM32 入门
summary: STM32 型号命名规则与各系列区别、如何选型、Blue Pill 开发板、三种开发方式（Arduino / HAL / 寄存器）、ST-Link 烧录与调试。
difficulty: advanced
minutes: 30
tags: [STM32, ARM, Cortex-M, 选型, 命名规则, Blue Pill, ST-Link, HAL, CubeMX]
order: 4
---

## STM32 家族

意法半导体（ST）的 32 位 ARM Cortex-M 单片机。型号有上千个，但都按同一套规则拼出来，学会拆开读，就能从名字里看出大部分参数。

### 型号怎么读

```
STM32 F 1 03 C 8 T 6
  │   │ │ │  │ │ │ └ 温度范围：6 = -40 ~ 85°C，7 = -40 ~ 105°C，3 = -40 ~ 125°C
  │   │ │ │  │ │ └── 封装：T = LQFP，U = QFN，H = BGA，Y = WLCSP，P = TSSOP
  │   │ │ │  │ └──── Flash 容量：8 = 64KB（见下表）
  │   │ │ │  └────── 引脚数：C = 48 脚（见下表）
  │   │ │ └───────── 产品线：F1 中 01 = 基本型，02 = USB 基本型，03 = 增强型，05 / 07 = 互联型（以太网、USB OTG）
  │   │ └─────────── 系列号：同一类型中数字越大通常越强（F0 < F1 < F4 < F7）
  │   └───────────── 产品类型：F = 主流，G = 新一代主流，C = 入门，L / U = 低功耗，H = 高性能，W = 无线
  └───────────────── ST 的 32 位 ARM 单片机
```

引脚数代码：

| 代码 | F | G | K | T | C | R | V | Z | I |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 引脚 | 20 | 28 | 32 | 36 | 48 | 64 | 100 | 144 | 176 |

Flash 容量代码：

| 代码 | 4 | 6 | 8 | B | C | D | E | F | G | H | I |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 容量 | 16K | 32K | 64K | 128K | 256K | 384K | 512K | 768K | 1M | 1.5M | 2M |

> 同一个字母在不同位置含义不同：第 4 段的 `T` 是 36 脚，第 6 段的 `T` 是 LQFP 封装，**按位置读**。

### 系列一览

| 定位 | 系列 | 内核 | 最高主频 | 适合 |
| --- | --- | --- | --- | --- |
| 入门 | C0 | Cortex-M0+ | 48MHz | 替代 8 位单片机，极低成本 |
| 主流 | F0 / G0 | Cortex-M0 / M0+ | 48 / 64MHz | 低成本产品 |
| 主流 | **F1** | Cortex-M3 | 72MHz | **经典入门，教程最多** |
| 主流 | F3 / G4 | Cortex-M4F | 72 / 170MHz | 电机控制、数字电源（模拟外设强） |
| 高性能 | **F4** | Cortex-M4F | 84 ~ 180MHz | 带硬件浮点，性能与资料兼顾，**进阶首选** |
| 高性能 | F7 / H7 | Cortex-M7 | 216 / 480MHz+ | 图形界面、音视频、复杂算法 |
| 高性能 | H5 | Cortex-M33 | 250MHz | 新一代，带安全特性 |
| 低功耗 | L0 / L4 / U5 | M0+ / M4 / M33 | 32 / 80 / 160MHz | 电池供电设备 |
| 无线 | WB / WL | M4 + M0+ / M4 | 64 / 48MHz | WB = 蓝牙 / Zigbee，WL = LoRa |
| 微处理器 | MP1 / MP2 | Cortex-A7 / A35 + M 核 | — | 能跑 Linux，已不算单片机 |

### 常见型号解读

| 型号 | 拆开读 | 常见于 |
| --- | --- | --- |
| STM32F103**C8T6** | F1 增强型，48 脚，64KB，LQFP | Blue Pill（本站内置） |
| STM32F103**RCT6** / **ZET6** | 同为 F103，64 脚 256KB / 144 脚 512KB | 正点原子、野火等教学开发板 |
| STM32F401**CCU6** / F411**CEU6** | F4 入门线，48 脚，256KB / 512KB，QFN | WeAct "Black Pill" |
| STM32F407**VET6** / **ZGT6** | F4 主力型号，100 脚 512KB / 144 脚 1MB，带以太网 | 进阶开发板、工控产品 |
| STM32G030**F6P6** | G0，20 脚，32KB，TSSOP | 小产品、替代 8 位机 |
| STM32H750**VBT6** | H7，100 脚，片内仅 128KB，靠外部 QSPI Flash 运行 | 高性能核心板 |

### 怎么选

| 需求 | 推荐 |
| --- | --- |
| 入门学习、跟教程学 HAL / 寄存器 | F103C8T6（Blue Pill）或 F103RCT6 / ZET6 教学板 |
| 需要浮点运算、更快、更多内存，但预算有限 | F411CEU6（Black Pill） |
| 以太网、引脚多、工作中常见 | F407 |
| 彩屏 GUI、高速信号处理 | H7 |
| 电池供电、超低功耗 | L4 / U5 |

### 换型号要改什么

- **只换容量或封装**（C8T6 → CBT6 → RCT6）：代码几乎不用改，在 CubeMX 或开发板选项里换个型号即可。
- **换系列**（F1 → F4）：HAL 函数名大体一致，但时钟树、引脚复用、外设寄存器都不同（F1 的 GPIO 配置方式和其他系列都不一样），需要在 CubeMX 重新生成工程，寄存器级代码要重写。
- 本站 FQBN 中的 `pnum=BLUEPILL_F103C8` 就是在告诉编译器具体型号，换芯片就要换 `pnum`。

### 国产兼容芯片

| 厂商 | 常见型号 | 兼容性 |
| --- | --- | --- |
| 兆易创新 GigaDevice | GD32F103、GD32F303 | 引脚兼容，主频更高，个别时序有差异 |
| 雅特力 Artery | AT32F403A、AT32F415 | 引脚兼容，主频高，推荐用厂家自己的库 |
| 极海 Geehy | APM32F103 | 高度兼容 |
| 中科芯 | CKS32F103 | Blue Pill 上常见 |
| 沁恒 WCH | CH32F103（ARM）/ CH32V103、V203、V307（**RISC-V**） | CH32V 引脚相似但 **内核不同**，需要专门的工具链 |

> 部分 Blue Pill 上的芯片是兼容片，ST-Link 烧录时可能提示 ID 不匹配。先看清芯片表面印的字，再决定是否需要调整烧录设置。

## Blue Pill 开发板

- 芯片：STM32F103C8T6
- 板载 LED：**PC13**，**低电平点亮**
- BOOT0 跳线：0 = 从 Flash 运行（正常），1 = 进入系统 Bootloader（串口烧录）
- 引脚：大部分 IO 是 3.3V，标注 FT 的引脚可耐受 5V
- Micro USB 默认只能供电，不能直接烧录（没有 USB Bootloader）

## 三种开发方式

| 方式 | 工具 | 适合 |
| --- | --- | --- |
| **Arduino** | 本站 / Arduino IDE + STM32duino | 快速上手，复用 Arduino 知识 |
| **HAL 库** | STM32CubeMX + CubeIDE / VS Code | 工业界主流，图形化配置时钟与外设 |
| **寄存器** | Keil / GCC | 深入理解硬件，面试常考 |

本站使用 STM32duino 核心（`STMicroelectronics:stm32`），Arduino API 全部可用：

```cpp
void setup() {
  pinMode(PC13, OUTPUT);
}
void loop() {
  digitalWrite(PC13, LOW);  delay(200);   // 点亮
  digitalWrite(PC13, HIGH); delay(800);   // 熄灭
}
```

## 烧录：ST-Link

STM32 使用 **SWD** 接口烧录与调试，只需 4 根线：

| ST-Link | Blue Pill |
| --- | --- |
| 3.3V | 3.3 |
| SWDIO | DIO（PA13） |
| SWCLK | CLK（PA14） |
| GND | GND |

```circuit
stm32-blink
```

使用 arduino-cli 烧录 STM32 需要先安装 **STM32CubeProgrammer**（ST 官网免费下载，需注册），并确保其命令行工具在系统 PATH 中。

其他烧录方式：

- **串口烧录**：BOOT0 = 1，用 USB 转 TTL 连接 PA9（TX）/ PA10（RX），FQBN 选项改为 `upload_method=serialMethod`。
- **DFU**：烧录 USB Bootloader 后可直接通过 USB 烧录。

## 在线调试（进阶）

SWD 不仅能烧录，还能 **单步调试**：设置断点、查看变量、查看寄存器——就像 Chrome DevTools！

- STM32CubeIDE 内置调试器。
- VS Code + **Cortex-Debug** 插件 + OpenOCD。
- Arduino IDE 2 对部分板子也支持调试。

## 学习 HAL 的路线

1. 安装 STM32CubeIDE，新建 F103C8 工程。
2. 在 CubeMX 图形界面中配置 PC13 为 GPIO_Output，配置时钟树（HSE 8MHz → PLL 72MHz）。
3. 生成代码，在 `while (1)` 中写 `HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13); HAL_Delay(500);`。
4. 依次学习：外部中断 → 定时器 → PWM → UART → ADC + DMA → I2C/SPI → FreeRTOS。
