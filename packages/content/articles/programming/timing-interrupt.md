---
title: 时间管理、非阻塞与中断
summary: 告别 delay：用 millis() 实现"多任务"，用外部中断与定时器中断及时响应事件。
difficulty: intermediate
minutes: 22
tags: [millis, 非阻塞, 中断, 定时器, 状态机]
order: 7
---

## delay 的问题

```cpp
void loop() {
  digitalWrite(13, HIGH); delay(1000);
  digitalWrite(13, LOW);  delay(1000);
  checkButton();          // 每 2 秒才检查一次按键！
}
```

`delay()` 期间 CPU 什么都不做（中断除外），按键、串口、传感器都得不到响应。

## millis()：非阻塞计时

`millis()` 返回上电以来的毫秒数（`unsigned long`，约 49 天后归零）。

```cpp
unsigned long lastBlink = 0;
bool ledOn = false;

void loop() {
  unsigned long now = millis();

  if (now - lastBlink >= 1000) {   // 类似 setInterval(fn, 1000)
    lastBlink = now;
    ledOn = !ledOn;
    digitalWrite(13, ledOn);
  }

  checkButton();                   // 每次 loop 都能执行
}
```

> 一定要写成 `now - last >= interval`，而不是 `now >= last + interval`，这样在 millis() 溢出归零时依然正确。

还有 `micros()` 返回微秒。

## 多任务：每个任务一个计时器

```cpp
void loop() {
  taskBlink();    // 每 500ms
  taskSensor();   // 每 2000ms
  taskSerial();   // 随时响应
}
```

每个任务内部自己维护 `lastRun`，互不阻塞。这就是 **协作式多任务**。

## 状态机

交通灯这类"按阶段切换"的逻辑，用状态机比一串 delay 清晰得多：

```cpp
enum State { RED, GREEN, YELLOW };
State state = RED;
unsigned long enteredAt = 0;

void loop() {
  unsigned long elapsed = millis() - enteredAt;
  switch (state) {
    case RED:    if (elapsed > 5000) go(GREEN);  break;
    case GREEN:  if (elapsed > 4000) go(YELLOW); break;
    case YELLOW: if (elapsed > 1000) go(RED);    break;
  }
}

void go(State next) {
  state = next;
  enteredAt = millis();
  // 根据 state 设置 LED
}
```

熟悉 React 的你一定不陌生：**state + 根据 state 渲染输出**。

## 外部中断

某个引脚电平变化时，CPU 立即暂停 `loop()`，跳去执行你的函数（ISR）：

```cpp
volatile bool pressed = false;   // 在中断中修改的变量必须加 volatile

void onButton() {                // ISR：要短！
  pressed = true;
}

void setup() {
  pinMode(2, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(2), onButton, FALLING);
}

void loop() {
  if (pressed) {
    pressed = false;
    Serial.println("按键按下");
  }
}
```

| 触发方式 | 含义 |
| --- | --- |
| `RISING` | 上升沿 LOW → HIGH |
| `FALLING` | 下降沿 HIGH → LOW |
| `CHANGE` | 任意变化 |
| `LOW` | 低电平期间持续触发 |

Uno 只有 D2、D3 支持外部中断；ESP32 和 Pico 几乎所有 GPIO 都支持。

### ISR 的规则

1. **尽量短**：只设置标志位，复杂处理放到 `loop()`。
2. 不要使用 `delay()`、`Serial.print()`。
3. 共享变量加 `volatile`；读取多字节变量时先 `noInterrupts()` 再 `interrupts()`。

## 定时器中断

芯片内部的 **定时器（Timer）** 可以每隔固定时间触发中断，精度比 millis 轮询更高：

- AVR：TimerOne 库、或直接配置 TCCR1A/TCCR1B 寄存器（见 [寄存器与底层编程](/library/programming/registers)）。
- ESP32：`timerBegin()` / `timerAttachInterrupt()`。
- RP2040：`add_repeating_timer_ms()`。

注意：Uno 的 Timer0 被 `millis()` / `delay()` 使用，Timer1 被 Servo 库使用，Timer2 被 `tone()` 使用，冲突时会出现奇怪现象。

## 看门狗

**看门狗（Watchdog）** 是一个硬件计时器，程序必须定期"喂狗"，否则芯片自动复位。用来防止程序卡死：

```cpp
#include <avr/wdt.h>
void setup() { wdt_enable(WDTO_2S); }
void loop()  { wdt_reset(); /* ... */ }
```
