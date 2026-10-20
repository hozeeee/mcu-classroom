---
title: I2C 总线
summary: 两根线挂上百个设备：理解 SDA/SCL、设备地址、开漏与上拉电阻，学会扫描 I2C 设备。
difficulty: intermediate
minutes: 18
tags: [I2C, IIC, Wire, SDA, SCL, 地址]
order: 2
---

## 基本概念

**I2C（Inter-Integrated Circuit，也写作 IIC）** 由飞利浦发明，特点：

- **两根线**：SDA（数据）、SCL（时钟），外加 VCC、GND。
- **同步**：主机提供时钟，不需要约定波特率。
- **总线结构**：多个设备并联在同一对线上，靠 **7 位地址** 区分（最多 112 个可用地址）。
- **半双工**：同一时刻只能单向传输。
- 速度：标准 100kHz、快速 400kHz。

## 接线

```
           VCC
            │
          [4.7k] [4.7k]  ← 上拉电阻（模块上通常已有）
            │      │
主机 SDA ───┴──────┼────── 设备1 SDA ──── 设备2 SDA
主机 SCL ──────────┴────── 设备1 SCL ──── 设备2 SCL
主机 GND ───────────────── 设备1 GND ──── 设备2 GND
```

| 开发板 | SDA | SCL |
| --- | --- | --- |
| Uno / Nano | A4 | A5 |
| ESP32 | GPIO21 | GPIO22（可重映射） |
| Pico | GP4 | GP5（可重映射） |
| Blue Pill | PB7 | PB6 |

## 为什么需要上拉电阻

I2C 设备的引脚是 **开漏输出**：只能把线拉到低电平，或者"松手"。松手时由上拉电阻把线拉回高电平。这样多个设备同时操作时不会发生短路。

## 通信过程

```
起始 → [7 位地址 + 读/写位] → ACK → [数据字节] → ACK → ... → 停止
```

1. **起始条件**：SCL 高电平时，SDA 从高变低。
2. 主机发送 **设备地址**，对应设备回复 **ACK**（拉低 SDA 一个时钟）。
3. 发送寄存器地址、读写数据。
4. **停止条件**：SCL 高电平时，SDA 从低变高。

## 常见设备地址

| 设备 | 地址 |
| --- | --- |
| SSD1306 OLED | 0x3C / 0x3D |
| LCD1602 PCF8574 | 0x27 / 0x3F |
| MPU6050 | 0x68 / 0x69 |
| BMP280 | 0x76 / 0x77 |
| DS3231 时钟 | 0x68 |
| BH1750 光照 | 0x23 / 0x5C |

地址冲突时（例如 MPU6050 和 DS3231 都是 0x68），可通过模块上的地址引脚修改，或使用 TCA9548A 多路复用器。

## I2C 扫描器

不确定地址时，运行下面的程序：

```cpp
#include <Wire.h>

void setup() {
  Wire.begin();
  Serial.begin(9600);
  Serial.println("扫描 I2C 设备...");
  for (byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    if (Wire.endTransmission() == 0) {
      Serial.print("发现设备: 0x");
      Serial.println(addr, HEX);
    }
  }
  Serial.println("扫描完成");
}

void loop() {}
```

## 读写寄存器

大多数 I2C 传感器内部有一组寄存器：

```cpp
// 读取 MPU6050 的 WHO_AM_I 寄存器（0x75），应返回 0x68
Wire.beginTransmission(0x68);
Wire.write(0x75);
Wire.endTransmission(false);       // 不发停止位，紧接着读
Wire.requestFrom(0x68, 1);
byte id = Wire.read();
```

实际开发中一般直接用传感器的库，库内部就是这些操作。

## 调试建议

- 设备找不到：检查 SDA/SCL 是否接反、是否共地、供电电压。
- 线太长（>1m）通信不稳定：降低速率或减小上拉电阻。
- 用 **逻辑分析仪** 抓波形，软件（PulseView / Logic 2）可以直接解码出 I2C 地址与数据。
