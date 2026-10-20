---
title: 寄存器与底层编程
summary: digitalWrite 背后发生了什么？通过直接操作 AVR 寄存器理解单片机的本质，为学习 STM32 打基础。
difficulty: advanced
minutes: 25
tags: [寄存器, 位运算, AVR, 底层, HAL]
order: 9
---

## 一切皆寄存器

单片机的外设（GPIO、定时器、串口、ADC）都是通过 **寄存器** 控制的。寄存器就是位于固定内存地址上的一组"开关"，每一位（bit）控制一个功能。

`digitalWrite(13, HIGH)` 最终做的事情是：把 **PORTB 寄存器的第 5 位** 置 1。

## 位运算复习

| 操作 | 写法 | 作用 |
| --- | --- | --- |
| 置位 | `REG \|= (1 << n)` | 第 n 位设为 1，其他位不变 |
| 清零 | `REG &= ~(1 << n)` | 第 n 位设为 0 |
| 翻转 | `REG ^= (1 << n)` | 第 n 位取反 |
| 读取 | `(REG >> n) & 1` | 读第 n 位 |

AVR 头文件里预定义了位名称，例如 `PB5` 等于 5，`_BV(PB5)` 等于 `(1 << 5)`。

## AVR GPIO 寄存器

ATmega328P 的每组端口（B、C、D）有三个寄存器：

| 寄存器 | 作用 |
| --- | --- |
| `DDRx` | 方向：1 = 输出，0 = 输入 |
| `PORTx` | 输出时：输出电平；输入时：1 = 开启上拉 |
| `PINx` | 读取引脚当前电平（对其写 1 可翻转输出） |

Uno 引脚与端口的对应：

| Arduino 引脚 | 端口位 |
| --- | --- |
| D0 ~ D7 | PORTD 0 ~ 7 |
| D8 ~ D13 | PORTB 0 ~ 5 |
| A0 ~ A5 | PORTC 0 ~ 5 |

## 寄存器版 Blink

```cpp
#include <util/delay.h>

void setup() {
  DDRB |= (1 << DDB5);          // D13 设为输出
}

void loop() {
  PORTB ^= (1 << PORTB5);       // 翻转 D13
  _delay_ms(500);
}
```

这段代码 **完全可以在本站仿真器中运行**，因为仿真器模拟的正是 ATmega328P 的寄存器。

## 为什么要学寄存器

1. **速度**：`digitalWrite` 需要查表、关中断，约 3 ~ 5μs；直接写寄存器只需 1 个时钟周期（62.5ns）。
2. **同时操作多个引脚**：`PORTD = 0b10101010;` 一次设置 8 个引脚。
3. **使用 Arduino 未封装的功能**：特殊的定时器模式、比较器、睡眠模式。
4. **为 STM32 打基础**：STM32 开发中经常要阅读参考手册里的寄存器描述。

## 定时器寄存器示例：Timer1 1Hz 中断

```cpp
void setup() {
  DDRB |= (1 << DDB5);
  noInterrupts();
  TCCR1A = 0;
  TCCR1B = (1 << WGM12) | (1 << CS12) | (1 << CS10);   // CTC 模式，1024 分频
  OCR1A = 15624;                                        // 16MHz / 1024 / 1Hz - 1
  TIMSK1 = (1 << OCIE1A);                               // 开启比较匹配中断
  interrupts();
}

ISR(TIMER1_COMPA_vect) {
  PORTB ^= (1 << PORTB5);
}

void loop() {}
```

## STM32 的抽象层次

| 层次 | 例子 | 特点 |
| --- | --- | --- |
| 寄存器 | `GPIOC->ODR ^= (1 << 13);` | 最快、最难 |
| LL 库 | `LL_GPIO_TogglePin(GPIOC, LL_GPIO_PIN_13);` | 轻量封装 |
| HAL 库 | `HAL_GPIO_TogglePin(GPIOC, GPIO_PIN_13);` | 官方主推，配合 CubeMX 图形化配置 |
| Arduino | `digitalWrite(PC13, ...)` | 最简单 |

## 如何阅读数据手册

- **Datasheet（数据手册）**：引脚定义、电气参数、封装。
- **Reference Manual（参考手册）**：每个外设、每个寄存器的详细说明，STM32 的参考手册有上千页。
- 不需要通读，**用到哪个外设查哪一章**。先看框图，再看寄存器表。
