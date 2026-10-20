---
title: 程序调试方法大全
summary: 从串口打印到逻辑分析仪、从仿真到 SWD 单步调试，系统化定位单片机程序的问题。
difficulty: intermediate
minutes: 20
tags: [调试, 串口, 仿真, 逻辑分析仪, SWD, GDB]
order: 5
---

## 先分清是软件问题还是硬件问题

```
现象异常
  │
  ├─ 仿真中正常，实物异常？ ──► 大概率是 硬件 / 接线 / 供电 问题
  │
  ├─ 仿真中也异常？         ──► 大概率是 代码逻辑 问题
  │
  └─ 板载 LED 程序都跑不起来？ ──► 烧录 / 开发板选择 / 驱动 问题
```

## 1. 串口打印（最常用）

就是 `console.log` 调试法：

```cpp
#define DEBUG 1
#if DEBUG
  #define LOG(x) Serial.println(x)
#else
  #define LOG(x)
#endif

void loop() {
  int v = analogRead(A0);
  LOG(v);
}
```

技巧：

- `setup()` 开头打印"启动"和版本号，能发现程序是否在反复重启。
- 打印变量时带上名字：`Serial.print("dist="); Serial.println(dist);`
- 打印 `millis()` 时间戳，分析时序。

## 2. LED 指示

没有串口时（例如在中断里、或串口被占用），用 LED 表示程序走到了哪里：

```cpp
digitalWrite(13, HIGH);  // 走到这里了
```

## 3. 浏览器仿真（本站）

工作台的 Uno 仿真器是一个 **完全可观察的环境**：

- 电路图上实时显示 LED 亮度、蜂鸣器频率。
- 仿真串口输出直接显示在下方面板。
- 可以随时 **暂停 / 继续 / 重置**，调整电位器、光敏电阻、按键的状态。
- 显示每个引脚的实时电平与模式。

不需要硬件，修改 → 编译 → 运行的循环只需几秒。

## 4. 万用表

验证 **静态电压**：电源是否正常、引脚是否输出高电平、按键按下后电压是否变化。见 [万用表使用入门](/library/practice/multimeter)。

## 5. 逻辑分析仪

¥30 左右的 8 通道 24MHz 逻辑分析仪 + 开源软件 **PulseView（sigrok）** 或 **Saleae Logic 2**：

- 同时抓取多根信号线的波形。
- 自动 **解码 UART / I2C / SPI / 单总线** 协议。
- 分析 PWM 占空比、时序是否符合数据手册。

通信类问题（I2C 设备没响应、SPI 屏幕花屏）用它能立刻看出是否有数据发出、对方是否回应 ACK。

## 6. 示波器

观察模拟波形：电源纹波、PWM 波形质量、信号上升沿。入门可以考虑手持示波器或 USB 示波器。

## 7. 在线调试（SWD / JTAG）

ARM 芯片（STM32、RP2040）和 ESP32 支持硬件调试，体验类似 Chrome DevTools：

- 设置 **断点**、**单步执行**。
- 查看 **变量** 和 **调用栈**。
- 查看 **外设寄存器** 的实时值。

工具组合：

| 芯片 | 调试器 | 软件 |
| --- | --- | --- |
| STM32 | ST-Link | STM32CubeIDE / VS Code + Cortex-Debug + OpenOCD |
| RP2040 | 另一块 Pico 刷 Picoprobe / Debug Probe | VS Code + Pico 插件 |
| ESP32 | ESP-Prog（JTAG），S3/C3 内置 USB JTAG | ESP-IDF / Arduino IDE 2 |

AVR（Uno）的 debugWIRE 调试较为麻烦，通常使用串口打印 + 仿真。

## 常见 bug 模式

| 症状 | 可能原因 |
| --- | --- |
| 程序运行一段时间后死机/重启 | 内存耗尽（String 拼接、递归、大数组）、看门狗、供电不足 |
| 数值突然变成负数 | 整数溢出（Uno 的 int 只有 16 位） |
| 计时不准 | `delay` 阻塞、在中断中做了耗时操作 |
| 中断里修改的变量在 loop 中不变 | 忘记 `volatile` |
| 按一次触发多次 | 按键抖动 |
| 偶发性读数错误 | 悬空引脚、接触不良、电源噪声 |

## 小黄鸭调试法

把代码逐行讲给别人（或一只小黄鸭）听。很多问题在你试图解释"这一行为什么这样写"的时候就自己暴露了。
