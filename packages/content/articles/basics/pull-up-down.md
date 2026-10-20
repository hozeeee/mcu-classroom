---
title: 上拉电阻与下拉电阻
summary: 为什么按键没按也会"自己触发"？理解悬空引脚、上拉/下拉电阻，以及 INPUT_PULLUP 的用法。
difficulty: beginner
minutes: 10
tags: [上拉, 下拉, 按键, INPUT_PULLUP]
order: 4
---

## 问题：悬空引脚

把按键一端接 5V，另一端接 D2，用 `digitalRead(2)` 读取：

- 按下时：D2 = 5V → HIGH ✅
- 松开时：D2 **什么都没接**（悬空），读数在 HIGH/LOW 之间随机跳动 ❌

悬空的输入引脚就像一根天线，手靠近、旁边线路的干扰都会改变它的电平。

## 解决：给引脚一个"默认值"

### 下拉电阻

```
5V ──[按键]──┬── D2
             │
           [10kΩ]
             │
            GND
```

- 松开：D2 通过 10kΩ 接到 GND → **LOW**
- 按下：D2 直接连 5V → **HIGH**（10kΩ 上流过 0.5mA，可忽略）

### 上拉电阻

```
5V ──[10kΩ]──┬── D2
             │
          [按键]
             │
            GND
```

- 松开：D2 通过 10kΩ 接到 5V → **HIGH**
- 按下：D2 直接连 GND → **LOW**

> 电阻为什么要 10kΩ 左右？太小（如 100Ω）按下时 5V 到 GND 电流过大；太大（如 10MΩ）抗干扰能力弱。1kΩ ~ 100kΩ 都能用，10kΩ 是最常见的选择。

## 内部上拉：INPUT_PULLUP

几乎所有单片机都内置了上拉电阻（ATmega328P 约 20 ~ 50kΩ），只需：

```cpp
pinMode(2, INPUT_PULLUP);
```

接线就只需要 **按键一端接 D2，另一端接 GND**，省掉外部电阻。注意此时逻辑是反的：**按下 = LOW**。

```cpp
if (digitalRead(2) == LOW) {
  // 按键被按下
}
```

本站的 [按键开关灯项目](/projects/button-led) 就使用了这种方式：

```circuit
button-led
```

## 在 I2C 中的上拉

I2C 总线的 SDA、SCL 两根线也需要上拉电阻（通常 4.7kΩ），因为 I2C 设备只能把线"拉低"，不能主动输出高电平（开漏输出）。大多数 I2C 模块板上已经焊好了上拉电阻。详见 [I2C 总线](/library/protocols/i2c)。

## 小结

| 模式 | 默认电平 | 按下电平 | 外部元件 |
| --- | --- | --- | --- |
| INPUT（无上下拉） | 不确定 ❌ | — | 需外接上/下拉电阻 |
| 外部下拉 | LOW | HIGH | 10kΩ 到 GND |
| 外部上拉 | HIGH | LOW | 10kΩ 到 VCC |
| INPUT_PULLUP | HIGH | LOW | 无 ✅ 推荐 |
