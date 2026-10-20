---
title: 使用第三方库
summary: 单片机世界的 npm：如何查找、安装、使用 Arduino 库，以及阅读库示例代码的技巧。
difficulty: beginner
minutes: 10
tags: [库, Library, arduino-cli]
order: 8
---

## 库是什么

和 npm 包一样，库封装了驱动某个传感器、实现某种协议的代码。例如：

| 需求 | 常用库 |
| --- | --- |
| 舵机 | Servo（内置） |
| I2C | Wire（内置） |
| SPI | SPI（内置） |
| DHT11/22 | DHT sensor library（Adafruit） |
| OLED | Adafruit SSD1306 + Adafruit GFX Library / U8g2 |
| LCD1602 I2C | LiquidCrystal I2C |
| WS2812 灯带 | Adafruit NeoPixel / FastLED |
| JSON | ArduinoJson |
| MQTT | PubSubClient |
| 按键 | OneButton / Bounce2 |
| 步进电机 | AccelStepper |

## 在本站安装

1. 打开 [环境中心 → 库管理](/environment)。
2. 搜索关键词（如 `DHT`），在结果里找到作者正确的库。
3. 点击 **安装**，后端执行 `arduino-cli lib install "DHT sensor library"`，**依赖会自动一起安装**（例如 Adafruit Unified Sensor）。

命令行等价操作：

```bash
arduino-cli lib search dht
arduino-cli lib install "DHT sensor library"
arduino-cli lib list
```

## 使用库

```cpp
#include <DHT.h>            // 1. 引入头文件

DHT dht(2, DHT11);          // 2. 创建对象（引脚、型号）

void setup() {
  dht.begin();              // 3. 初始化
}

void loop() {
  float t = dht.readTemperature();   // 4. 调用方法
}
```

不知道怎么用？**看库自带的示例**：每个库都有 `examples` 目录。也可以在 GitHub 上查看库的 README。

## 选库的经验

- 优先使用 **Adafruit、SparkFun、官方** 出品的库，文档和维护质量较高。
- 看最近更新时间和 GitHub star 数。
- 注意 **平台兼容性**：有些库只支持 AVR（直接操作 AVR 寄存器），在 ESP32 上编译失败。
- 同名头文件冲突时，arduino-cli 会在编译日志里提示 `Multiple libraries were found for "xxx.h"`，并显示实际使用的是哪一个。

## 库存放在哪里

本站把库安装在 `~/.mcu-classroom/toolchain/user/libraries`，与系统 Arduino IDE 的库相互隔离。
