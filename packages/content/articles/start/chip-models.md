---
title: 看懂芯片型号：芯片、模组与开发板
summary: 商品标题里的 ESP32、WROOM-32、DevKit 分别是什么？型号里每一段字母数字代表什么？四大平台型号速查与选型思路。
difficulty: beginner
minutes: 12
tags: [选型, 芯片型号, 命名规则, 模组, ESP32, STM32, AVR, RP2040]
order: 3
---

## 先分清三层：芯片、模组、开发板

新手买板子时最容易懵的，是商品标题里同时出现好几种"型号"。它们其实属于三个层级：

| 层级 | 是什么 | 例子 |
| --- | --- | --- |
| **芯片**（MCU / SoC） | 真正运行程序的那颗黑色方块，型号印在芯片表面 | ATmega328P、ESP32-S3、STM32F103C8T6、RP2040 |
| **模组**（Module） | 芯片 + Flash + 晶振 + 天线，封在一块带金属屏蔽罩的小板上。主要出现在 **无线芯片**（如 ESP32）上，因为射频电路难做，厂家做好并通过认证后再卖 | ESP32-WROOM-32E、ESP32-S3-WROOM-1 |
| **开发板**（Dev Board） | 芯片或模组 + USB 接口 + 稳压 + 按键 + 排针，插上 USB 就能用 | Arduino Uno、ESP32 DevKitC、Blue Pill、Pico |

```
开发板  ESP32 DevKitC             ← 板子的名字：外形、接口、引脚排列
 └ 模组   ESP32-WROOM-32E           ← 银色铁壳上印的字
    └ 芯片   ESP32-D0WD-V3            ← 铁壳里面的芯片
```

几个推论：

- **同一颗芯片可以做成很多种开发板**：STM32F103C8T6 → Blue Pill、各家"最小系统板"。
- **同一个开发板品牌也可能换芯片**：Arduino Uno R3 是 AVR，**Uno R4 用的是瑞萨 RA4M1**（ARM），已经不是同一种芯片。
- 所以选型时要看 **芯片 / 模组型号**，开发板名只说明"外形和板上的配件"。

> 常见误会："ESP32-WROOM-32 和 ESP32-S3 哪个更新？"——前者是 **模组**（里面是经典款 ESP32 芯片），后者是 **另一个芯片系列**（对应模组叫 ESP32-S3-WROOM-1），两者不在同一层，不能直接比。详见 [ESP32 入门](/library/platforms/esp32-intro)。

## 型号的通用读法

各厂商规则不同，但大多按下面的顺序拼出来：

```
厂商前缀 + 系列 + 档次/子系列 + 容量 + 引脚/封装 + 温度/版本
```

| 段 | 告诉你什么 | 举例 |
| --- | --- | --- |
| 厂商前缀 | 谁家的 | STM32 = 意法半导体、AT = Atmel（现属 Microchip）、ESP = 乐鑫、RP = 树莓派、GD32 = 兆易创新 |
| 系列 | 内核与定位 | STM32**F1** = Cortex-M3 主流款；ESP32-**C**3 = RISC-V 内核 |
| 容量 | Flash / RAM 大小 | ATmega**32**8P = 32KB Flash；STM32F103C**8** = 64KB；ESP32-S3-WROOM-1-**N16R8** = 16MB Flash + 8MB PSRAM |
| 引脚 / 封装 | 多少个脚、什么外形，决定能不能手工焊接 | STM32F103**C**8**T**6 = 48 脚 LQFP；ATmega328P-**P**U = DIP 直插 |
| 温度 / 版本 | 工作温度范围、芯片修订版本 | STM32F103C8T**6** = -40 ~ 85°C；ESP32-D0WD-**V3** = 第 3 版硅片 |

几条经验：

- **同一系列、只差容量或封装的型号，代码基本通用**（STM32F103C8 ↔ F103CB ↔ F103RC）。
- **系列字母/数字变了，就当作一颗新芯片**：引脚、外设、库都可能不同（ESP32 → ESP32-C3，STM32F1 → STM32F4）。
- 末尾的封装、温度、包装后缀（`-AU`、`T6`、`TR`）只影响采购和焊接，**不影响写代码**。

## 四大平台型号速查

| 平台 | 典型型号 | 拆开读 | 详细说明 |
| --- | --- | --- | --- |
| AVR | ATmega328P-PU | Atmel megaAVR，32KB Flash，P = 低功耗版，PU = DIP 直插封装 | [Arduino AVR 平台详解](/library/platforms/arduino-avr) |
| ESP32 | ESP32-S3-WROOM-1-N16R8 | S3 芯片，WROOM 模组第 1 版，16MB Flash，8MB PSRAM | [ESP32 入门](/library/platforms/esp32-intro) |
| STM32 | STM32F103C8T6 | F1 系列增强型，48 脚，64KB Flash，LQFP 封装，工业级温度 | [STM32 入门](/library/platforms/stm32-intro) |
| 树莓派 | RP2040 | 2 个核心，Cortex-M0+，264KB RAM，芯片内无 Flash | [树莓派 Pico 入门](/library/platforms/pico-intro) |

## 选芯片的思路

不要从型号出发，从 **需求** 出发，按顺序排除：

1. **要不要无线？** 要 WiFi / 蓝牙 → ESP32 家族（或 Pico W）。不要 → 都可以。
2. **外设是什么电压？** 手头大多是 5V 模块 → AVR（Uno）最省心；3.3V 平台接 5V 模块要做电平转换。
3. **要多少引脚和外设？** 数一数要接的传感器、屏幕、串口数量，再留 30% 余量。
4. **要多少内存？** 简单控制 2KB RAM 都够；彩屏界面、摄像头、AI 识别需要 MB 级内存（如 ESP32-S3 + PSRAM）。
5. **资料多不多？** 新手优先选"出了问题能搜到答案"的型号：ATmega328P、经典 ESP32、STM32F103 / F411、RP2040。
6. **最后看价格和封装**：以后要自己画板焊接，优先选 LQFP、SOP 这类引脚露在外面的封装，避开 QFN、BGA。

## 去哪里查型号含义

每颗芯片的官方 **数据手册（Datasheet）** 里都有命名规则表，搜索关键词 **Ordering information** 或 **Part numbering**：

- ST：每份 STM32 Datasheet 末尾的 "Ordering information" 章节。
- 乐鑫：各系列《技术规格书》开头的"型号对比"章节，列出了每个芯片/模组的 Flash、PSRAM 配置。
- Microchip：《ATmega328P Datasheet》的 "Ordering Information" 章节。
- 树莓派：《RP2040 Datasheet》第 1 章解释了"RP2040"这个名字的含义。

下一步：[入门物料清单与采购建议](/library/start/starter-kit)
