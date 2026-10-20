---
title: 数字输出：点亮 LED
summary: pinMode 与 digitalWrite 的用法，引脚的输出能力，以及你的第一个单片机程序。
difficulty: beginner
minutes: 12
tags: [GPIO, digitalWrite, LED, 输出]
order: 3
---

## GPIO 是什么

**GPIO（General Purpose Input/Output，通用输入输出）** 是单片机上可以由程序控制的引脚。每个 GPIO 可以配置为：

- **输出**：程序决定它是 HIGH（5V/3.3V）还是 LOW（0V）
- **输入**：程序读取外部给它的电压是高还是低

## 两个函数

```cpp
pinMode(13, OUTPUT);       // 把 13 号引脚设为输出
digitalWrite(13, HIGH);    // 输出高电平
digitalWrite(13, LOW);     // 输出低电平
```

## 第一个程序：Blink

```cpp
const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(500);
  digitalWrite(LED_PIN, LOW);
  delay(500);
}
```

Uno 的 D13 上接了一颗板载 LED（标记为 L），所以不接任何外部元件也能看到效果。本项目额外在 D13 上接了一颗外部 LED：

```circuit
blink
```

去 [LED 闪烁项目](/projects/blink) 点击 **在工作台打开**，然后：

1. 点 **编译**（第一次使用需要先在环境中心安装 AVR 核心）。
2. 点 **运行仿真**，电路图上的 LED 会开始闪烁。
3. 有实物的话，插上 USB，选择端口，点 **烧录**。

## 引脚的驱动能力

| 芯片 | 单引脚推荐电流 | 绝对最大值 | 总电流上限 |
| --- | --- | --- | --- |
| ATmega328P | 20mA | 40mA | 200mA |
| ESP32 | 20mA | 40mA | — |
| RP2040 | 4 ~ 12mA（可配置） | — | 50mA |
| STM32F103 | 8mA | 25mA | 150mA |

超过就会损坏引脚。所以：LED 一定要串电阻、电机继电器要用驱动电路。

## 灌电流与拉电流

- **拉电流（Source）**：引脚输出 HIGH，电流从引脚流出 → LED → GND。
- **灌电流（Sink）**：LED 接在 VCC 与引脚之间，引脚输出 LOW 时 LED 亮。

ESP8266、部分 ESP32 板的板载 LED 就是灌电流接法，所以 `digitalWrite(LED, LOW)` 才会点亮——不要奇怪。

## 练习

- 修改 `delay` 的数值，让 LED 快闪 / 慢闪。
- 做一个 SOS 求救信号（三短三长三短）。
- 完成 [交通灯项目](/projects/traffic-light)，同时控制三颗 LED。
