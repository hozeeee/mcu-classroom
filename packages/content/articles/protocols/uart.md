---
title: UART 串口协议
summary: 两根线如何传输数据？理解起始位、数据位、停止位、波特率，以及 TX/RX 交叉连接。
difficulty: intermediate
minutes: 15
tags: [UART, 串口, 协议, TTL, RS232]
order: 1
---

## 基本概念

**UART（Universal Asynchronous Receiver/Transmitter）** 是最简单、最常用的通信方式：

- **两根数据线**：TX（发送）、RX（接收），外加 GND。
- **异步**：没有时钟线，双方事先约定 **波特率**。
- **全双工**：可以同时收发。
- **点对点**：一对一通信。

## 接线：TX 接 RX

```
设备 A          设备 B
  TX  ────────►  RX
  RX  ◄────────  TX
  GND ─────────  GND
```

> 最常见的错误：TX 接 TX。记住"我说的话要进你的耳朵"。

## 一帧数据的格式

```
空闲 ‾‾‾‾╲___╱‾‾‾╲___╱‾‾‾‾‾‾╲___╱‾‾‾‾‾‾‾ 空闲
        起始 D0  D1  D2 ... D7  停止
         0                       1
```

- 空闲时为高电平。
- **起始位**：1 位低电平，告诉对方"开始了"。
- **数据位**：通常 8 位，**低位在前**（LSB first）。
- **校验位**：可选，通常无。
- **停止位**：1 位高电平。

所以常说的 **9600 8N1** = 波特率 9600、8 数据位、无校验、1 停止位。每字节实际传 10 位，9600 波特率每秒约传 960 字节。

## 电平标准

| 标准 | 逻辑 1 | 逻辑 0 | 场景 |
| --- | --- | --- | --- |
| TTL（5V） | 5V | 0V | Arduino Uno |
| TTL（3.3V） | 3.3V | 0V | ESP32、STM32、Pico |
| RS-232 | -3 ~ -15V | +3 ~ +15V | 老电脑 DB9 接口、工控设备 |
| RS-485 | 差分信号 | | 工业远距离总线（千米级） |

⚠️ **RS-232 电平直接接单片机会烧坏芯片**，需要 MAX232 转换。5V TTL 接 3.3V 芯片也需要电平转换。

## 单片机上的多个串口

| 芯片 | 硬件串口 |
| --- | --- |
| Uno | 1 个（D0/D1，与 USB 共用） |
| Mega2560 | 4 个 |
| ESP32 | 3 个（Serial、Serial1、Serial2，引脚可重映射） |
| STM32F103 | 3 个 |
| RP2040 | 2 个 + USB CDC |

Uno 只有一个硬件串口且被 USB 占用，想连接其他串口模块（蓝牙 HC-05、GPS）可以用 **SoftwareSerial** 库在任意引脚模拟串口：

```cpp
#include <SoftwareSerial.h>
SoftwareSerial bt(10, 11);   // RX, TX

void setup() {
  Serial.begin(9600);
  bt.begin(9600);
}

void loop() {
  if (bt.available()) Serial.write(bt.read());   // 蓝牙 → 电脑
  if (Serial.available()) bt.write(Serial.read()); // 电脑 → 蓝牙
}
```

## USB 转 TTL 模块

CH340 / CP2102 / FT232 模块能让电脑直接与任何 UART 设备通信，用于：

- 给没有 USB 口的板子（如 ESP-01、裸 STM32）烧录程序。
- 抓取两个设备之间的通信数据。

## 自定义通信协议

传输结构化数据时，推荐设计简单的帧格式，例如：

```
$TEMP,23.5,HUM,60*\n
```

或者使用 JSON（ArduinoJson 库），前端解析起来最方便。
