---
title: Arduino AVR 平台详解
summary: AVR 型号怎么读、常见 AVR 芯片与 Arduino 开发板的对应关系、ATmega328P 的内部结构、Uno 与 Nano 的区别、Bootloader、引脚复用与资源限制。
difficulty: intermediate
minutes: 20
tags: [Arduino, AVR, ATmega328P, 选型, 命名规则, Uno, Nano, Bootloader]
order: 1
---

## ATmega328P 概览

| 项目 | 参数 |
| --- | --- |
| 架构 | 8 位 AVR RISC，大部分指令 1 个时钟周期 |
| 主频 | 16MHz（外部晶振） |
| Flash | 32KB（其中 0.5KB 被 Bootloader 占用） |
| SRAM | 2KB |
| EEPROM | 1KB（断电不丢失，可用 EEPROM 库读写） |
| GPIO | 23 个 |
| ADC | 6 通道 10 位 |
| PWM | 6 路 |
| 定时器 | Timer0（8 位）、Timer1（16 位）、Timer2（8 位） |
| 通信 | 1×UART、1×SPI、1×I2C |
| 工作电压 | 1.8 ~ 5.5V |

## 型号怎么读

```
AT mega 32 8 P - P U
│   │    │  │ │   │ └ U = 工业级温度、无铅环保
│   │    │  │ │   └── 封装：P = PDIP 直插，A = TQFP 贴片，M = QFN 贴片
│   │    │  │ └────── P = picoPower 低功耗版
│   │    │  └──────── 子系列：ATmega48 / 88 / 168 / 328 是引脚兼容的一组，只差容量
│   │    └─────────── Flash 容量：32KB
│   └──────────────── 家族：tiny = 小引脚、小容量；mega = 主力
└───────────────────── Atmel（2016 年被 Microchip 收购，型号沿用）
```

- Uno R3 上可拔下的长条芯片是 **ATmega328P-PU**（DIP28 直插）。
- Nano 上的是 **ATmega328P-AU**（TQFP32 贴片），贴片封装多出两个引脚，所以 Nano 比 Uno 多了 A6、A7。
- 封装后缀只影响外形和焊接，**程序完全一样**。
- ATmega328**PB** 是后出的增强版（多一组 UART / SPI / I2C），与 328P 不完全兼容，Arduino 官方核心不直接支持（可用第三方 MiniCore）。

### 常见 AVR 芯片

| 芯片 | Flash / SRAM | 特点 | 常见开发板 |
| --- | --- | --- | --- |
| ATtiny85 | 8KB / 512B | 8 个引脚，极小 | Digispark |
| ATmega168 | 16KB / 1KB | 328P 的小容量版 | 早期 Nano / Pro Mini |
| **ATmega328P** | 32KB / 2KB | 最经典 | Uno R3、Nano、Pro Mini |
| ATmega32U4 | 32KB / 2.5KB | **U = 自带 USB**，可以模拟键盘鼠标 | Leonardo、Pro Micro |
| ATmega2560 | 256KB / 8KB | 100 脚，54 个数字 IO，4 个串口 | Mega 2560 |
| ATmega4809 | 48KB / 6KB | 新一代 megaAVR 0 系列 | Nano Every、Uno WiFi Rev2 |

怎么选：入门学习选 **328P（Uno / Nano）**；引脚、串口不够用（如 3D 打印机、多传感器）选 **2560（Mega）**；想做 USB 键盘/游戏手柄选 **32U4（Leonardo / Pro Micro）**。

### "Arduino" 不等于 AVR

Arduino 是一套 **生态**（开发板 + IDE + 库），不是某颗芯片。名字里带 Arduino 的板子，主控可能完全不同：

| 开发板 | 主控 | 架构 |
| --- | --- | --- |
| Uno R3 / Nano / Mega 2560 / Leonardo | ATmega 系列 | 8 位 AVR |
| Uno R4 Minima / WiFi | 瑞萨 RA4M1（R4 WiFi 另加 ESP32-S3 负责联网） | 32 位 ARM Cortex-M4 |
| Nano 33 IoT | SAMD21 | 32 位 ARM Cortex-M0+ |
| Nano ESP32 | ESP32-S3 | 32 位 Xtensa LX7 |
| Nano RP2040 Connect | RP2040 | 32 位 ARM Cortex-M0+ |

用 Arduino API（`digitalWrite` 等）写的程序在它们之间大多可以通用，但直接操作 AVR 寄存器（`PORTB`、`DDRB`）的代码只能在 AVR 上跑。本站仿真器也只支持 **Uno R3**。

> 板子上还有第二颗芯片：原版 Uno R3 是 ATmega16U2，兼容版多是 CH340。它只负责 USB 转串口，不运行你的程序——选型时看的是主控。

## Uno 与 Nano

| | Uno R3 | Nano |
| --- | --- | --- |
| 芯片 | ATmega328P（DIP 直插，可更换） | ATmega328P（贴片） |
| USB | Type-B（大方口） | Mini-USB / Type-C |
| 额外引脚 | — | 多出 A6、A7（仅模拟输入） |
| 尺寸 | 68.6 × 53.4 mm | 45 × 18 mm，可直接插在面包板上 |
| FQBN | `arduino:avr:uno` | `arduino:avr:nano`（克隆版常需 `:cpu=atmega328old`） |

代码完全通用。

## Bootloader：为什么 USB 就能烧录

芯片 Flash 的末尾预先烧了一小段 **Bootloader（Optiboot）** 程序：

1. 上电/复位后先运行 Bootloader。
2. 它监听串口约 0.5 秒，如果收到电脑发来的烧录命令，就把新程序写入 Flash。
3. 否则跳转执行用户程序。

电脑上的 `avrdude` 在烧录前通过 USB 转串口芯片的 **DTR** 信号让芯片复位，从而进入 Bootloader。详见 [程序烧录原理](/library/practice/flashing)。

## 引脚复用

一个引脚往往有多种功能，同一时刻只能用一种：

| 引脚 | 功能 |
| --- | --- |
| D0 / D1 | UART RX / TX（与 USB 共用，尽量不要接其他东西） |
| D2 / D3 | 外部中断 INT0 / INT1 |
| D3, D5, D6, D9, D10, D11 | PWM |
| D10 ~ D13 | SPI（SS、MOSI、MISO、SCK） |
| A4 / A5 | I2C（SDA / SCL） |
| A0 ~ A5 | 模拟输入，也可作数字引脚 D14 ~ D19 |

可以在 [工具箱 → 引脚图](/toolbox) 中查看每块板的完整引脚。

## 资源冲突速查

| 功能 | 占用资源 | 冲突 |
| --- | --- | --- |
| `millis()` / `delay()` | Timer0 | D5、D6 的 PWM 频率固定 |
| Servo 库 | Timer1 | D9、D10 不能使用 `analogWrite` |
| `tone()` | Timer2 | D3、D11 的 PWM 受影响 |
| SoftwareSerial | 引脚变化中断 | 同时只能有一个在接收 |

## 本站仿真器

本站内置的 Uno 仿真基于 [avr8js](https://github.com/wokwi/avr8js)，在浏览器里逐条执行 ATmega328P 指令，模拟了 GPIO、定时器、PWM、USART、ADC。因此编译出的 **真实 HEX 文件** 可以直接运行，行为与实物几乎一致。
