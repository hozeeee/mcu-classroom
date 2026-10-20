---
title: 显示设备：LCD1602、OLED、数码管
summary: 让单片机输出画面：常见显示设备的接口、库与选型。
difficulty: intermediate
minutes: 14
tags: [显示, OLED, LCD1602, 数码管, I2C]
order: 5
---

## 选型速览

| 设备 | 分辨率 | 接口 | 占用引脚 | 优点 | 缺点 |
| --- | --- | --- | --- | --- | --- |
| LED 数码管 | 4 位数字 | 直驱 / TM1637 | 2（TM1637） | 醒目、便宜 | 只能显示数字 |
| LCD1602 | 16×2 字符 | 并口 / **I2C 背包** | 2（I2C） | 便宜、资料多 | 只能显示字符，体积大 |
| 0.96" OLED SSD1306 | 128×64 | **I2C** / SPI | 2（I2C） | 自发光、对比度高、可画图 | 屏幕小 |
| 1.3" OLED SH1106 | 128×64 | I2C / SPI | 2 | 稍大 | 驱动不同，需用对应库 |
| TFT 彩屏 ST7789 | 240×240 等 | SPI | 4 ~ 5 | 彩色 | Uno 内存不足以驱动，适合 ESP32 |

**入门推荐：0.96 寸 I2C OLED**，四根线即可。

## OLED（SSD1306）

接线（Uno）：

| OLED | Uno |
| --- | --- |
| GND | GND |
| VCC | 5V（或 3.3V） |
| SCL | A5 |
| SDA | A4 |

库：Adafruit SSD1306 + Adafruit GFX（或 U8g2）。

```cpp
display.clearDisplay();
display.setTextSize(2);
display.setCursor(0, 0);
display.println("Hello");
display.display();   // 关键：必须调用 display() 才会刷新到屏幕
```

> Adafruit 库需要 1KB 显存缓冲区，占用 Uno 一半内存，代码复杂后可能不够。内存紧张时改用 U8g2 的"页缓冲"模式。

详见 [OLED 显示项目](/projects/oled)。

## LCD1602 + I2C 背包

- 原生 LCD1602 需要 6 ~ 10 根线，背面焊一块 PCF8574 I2C 转接板后只需 2 根。
- 常见地址 0x27 或 0x3F。
- 背面蓝色电位器用于调对比度——**屏幕亮但没字？先拧它**。
- 库：LiquidCrystal I2C。

## 数码管

- 每位由 7 段 + 小数点共 8 个 LED 组成，分 **共阴** 和 **共阳**。
- 多位数码管靠 **动态扫描**（快速轮流点亮每一位）利用视觉暂留。
- 推荐直接买 **TM1637 四位数码管模块**，两根线驱动。

## 中文显示

OLED 显示中文需要字库：U8g2 自带部分中文字体（如 `u8g2_font_wqy12_t_gb2312`），但字库较大，Uno 存不下，建议用 ESP32。
