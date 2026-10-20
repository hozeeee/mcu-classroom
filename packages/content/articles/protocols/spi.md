---
title: SPI 总线
summary: 高速的四线总线：MOSI、MISO、SCK、CS，以及时钟极性与相位（SPI 模式）。
difficulty: intermediate
minutes: 15
tags: [SPI, MOSI, MISO, SCK, CS]
order: 3
---

## 基本概念

**SPI（Serial Peripheral Interface）** 是一种高速同步串行总线：

- **四根线**：
  - **SCK**（SCLK）：时钟，由主机产生
  - **MOSI**（COPI）：主机输出、从机输入
  - **MISO**（CIPO）：主机输入、从机输出
  - **CS**（SS）：片选，低电平选中某个从机
- **全双工**：每个时钟周期同时发送和接收一位。
- **速度快**：几 MHz 到几十 MHz，远高于 I2C。
- 每个从机需要一根独立的 CS 线。

## 接线

```
主机              从机 1        从机 2
SCK  ─────────┬──► SCK    ┌──► SCK
MOSI ─────────┼──► MOSI   ├──► MOSI
MISO ◄────────┼─── MISO   ├─── MISO
CS1  ─────────┼──► CS     │
CS2  ─────────┼───────────┼──► CS
              └───────────┘
```

| 开发板 | SCK | MOSI | MISO | CS（默认） |
| --- | --- | --- | --- | --- |
| Uno | D13 | D11 | D12 | D10 |
| ESP32（VSPI） | GPIO18 | GPIO23 | GPIO19 | GPIO5 |
| Pico（SPI0） | GP18 | GP19 | GP16 | GP17 |
| Blue Pill（SPI1） | PA5 | PA7 | PA6 | PA4 |

> Uno 的 D13 同时接着板载 LED，所以使用 SPI 时 LED 会闪烁，这是正常的。

## SPI 模式

时钟极性（CPOL）和相位（CPHA）组合成 4 种模式，主从机必须一致：

| 模式 | CPOL（空闲电平） | CPHA（采样边沿） |
| --- | --- | --- |
| 0 | 低 | 第一个边沿（上升沿） |
| 1 | 低 | 第二个边沿（下降沿） |
| 2 | 高 | 第一个边沿（下降沿） |
| 3 | 高 | 第二个边沿（上升沿） |

大多数设备使用 **模式 0**，以数据手册为准。

## Arduino 代码

```cpp
#include <SPI.h>

const int CS_PIN = 10;

void setup() {
  pinMode(CS_PIN, OUTPUT);
  digitalWrite(CS_PIN, HIGH);   // 默认不选中
  SPI.begin();
}

byte transfer(byte data) {
  SPI.beginTransaction(SPISettings(1000000, MSBFIRST, SPI_MODE0));
  digitalWrite(CS_PIN, LOW);    // 选中从机
  byte result = SPI.transfer(data);
  digitalWrite(CS_PIN, HIGH);   // 释放
  SPI.endTransaction();
  return result;
}
```

## 常见 SPI 设备

- SD 卡模块
- RC522 RFID 读卡器
- TFT 彩屏（ST7789、ILI9341）
- W25Qxx Flash 存储
- MAX7219 点阵 / 数码管驱动
- NRF24L01 无线模块

## 三大协议对比

| | UART | I2C | SPI |
| --- | --- | --- | --- |
| 线数 | 2（TX、RX） | 2（SDA、SCL） | 4（+每从机 1 根 CS） |
| 时钟 | 异步 | 同步 | 同步 |
| 设备数 | 1 对 1 | 多（地址区分） | 多（CS 区分） |
| 速度 | ~115200 bps 常用 | 100k ~ 400kHz | 1 ~ 80MHz |
| 双工 | 全双工 | 半双工 | 全双工 |
| 典型用途 | 调试、GPS、蓝牙 | 传感器、OLED | 屏幕、SD 卡、Flash |
