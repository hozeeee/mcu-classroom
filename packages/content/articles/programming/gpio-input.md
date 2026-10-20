---
title: 数字输入：读取按键
summary: digitalRead 读取按键、边沿检测、软件消抖，让单片机响应你的操作。
difficulty: beginner
minutes: 15
tags: [GPIO, digitalRead, 按键, 消抖, 边沿检测]
order: 4
---

## 读取引脚

```cpp
pinMode(2, INPUT_PULLUP);       // 输入 + 内部上拉
int state = digitalRead(2);     // HIGH 或 LOW
```

为什么要 `INPUT_PULLUP`？请先阅读 [上拉电阻与下拉电阻](/library/basics/pull-up-down)。

## 按住亮、松开灭

```cpp
void loop() {
  bool pressed = digitalRead(2) == LOW;
  digitalWrite(13, pressed ? HIGH : LOW);
}
```

## 按一下切换：边沿检测

想要"按一次开、再按一次关"，需要检测按键 **从松开变为按下** 的瞬间（下降沿），而不是"是否按着"：

```cpp
bool lastPressed = false;
bool ledOn = false;

void loop() {
  bool pressed = digitalRead(2) == LOW;
  if (pressed && !lastPressed) {   // 上一次没按，这一次按了
    ledOn = !ledOn;
    digitalWrite(13, ledOn);
  }
  lastPressed = pressed;
}
```

这和前端中"监听 keydown 而不是轮询 key 是否按下"的思路类似。

## 按键抖动

机械按键按下的瞬间，金属触点会弹跳几毫秒，电平实际上是这样的：

```
松开 ‾‾‾‾‾‾╲_╱‾╲_╱╲________ 按下
             ↑ 抖动 5~20ms ↑
```

单片机执行速度很快，会把一次按下识别成多次。解决方法：

### 软件消抖（推荐）

```cpp
const unsigned long DEBOUNCE_MS = 30;
bool stableState = HIGH;
bool lastReading = HIGH;
unsigned long lastChange = 0;

void loop() {
  bool reading = digitalRead(2);
  if (reading != lastReading) {
    lastChange = millis();          // 电平变化，重新计时
  }
  if (millis() - lastChange > DEBOUNCE_MS && reading != stableState) {
    stableState = reading;          // 稳定 30ms 才认为是真的变化
    if (stableState == LOW) {
      // 确认按下
    }
  }
  lastReading = reading;
}
```

是不是很像前端的 **debounce**？原理完全一样。

### 硬件消抖

在按键两端并联一个 100nF 电容，利用电容充放电平滑电平。

## 仿真体验

[按键开关灯项目](/projects/button-led) 可以在仿真中点击按键：

```circuit
button-led
```

## 使用库

按键逻辑写多了很繁琐，可以使用 **Bounce2** 或 **OneButton** 库，支持单击、双击、长按事件。
