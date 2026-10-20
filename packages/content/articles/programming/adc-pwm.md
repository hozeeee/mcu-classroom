---
title: 模拟输入 ADC 与 PWM 输出
summary: analogRead 读取电位器、光敏电阻；analogWrite 控制 LED 亮度和电机速度；map 与 constrain 的使用。
difficulty: beginner
minutes: 18
tags: [ADC, PWM, analogRead, analogWrite, map]
order: 6
---

## analogRead：读取电压

```cpp
int raw = analogRead(A0);              // Uno: 0 ~ 1023
float voltage = raw * 5.0 / 1023.0;    // 换算成电压
```

- Uno 的 A0 ~ A5 是模拟输入引脚（A4/A5 同时也是 I2C）。
- ESP32 的 ADC2 在 WiFi 开启时不可用，请使用 ADC1（GPIO32 ~ 39）。
- 读数会有 ±2 左右的跳动，可以取多次平均。

### 电位器分压

```circuit
potentiometer
```

电位器两端接 5V 和 GND，中间脚接 A0，转动旋钮时中间脚电压在 0 ~ 5V 间变化。本站仿真中可以 **拖动电位器滑块** 改变读数。

## analogWrite：PWM 输出

```cpp
analogWrite(9, 128);   // 占空比 128/255 ≈ 50%
```

- 取值 0 ~ 255。
- Uno 仅 D3、D5、D6、D9、D10、D11 支持。
- ESP32 Arduino 核心 3.x 支持 `analogWrite`，也可以使用功能更强的 `ledcAttach` / `ledcWrite`。
- 原理见 [数字信号与模拟信号](/library/basics/digital-analog)。

## map 与 constrain

把一个范围的值映射到另一个范围：

```cpp
int raw = analogRead(A0);                      // 0 ~ 1023
int brightness = map(raw, 0, 1023, 0, 255);    // → 0 ~ 255
brightness = constrain(brightness, 0, 255);    // 夹紧到范围内
analogWrite(9, brightness);
```

`map` 使用整数运算，相当于 JS 里的：

```js
const map = (x, inMin, inMax, outMin, outMax) =>
  Math.trunc((x - inMin) * (outMax - outMin) / (inMax - inMin) + outMin)
```

## 呼吸灯

```cpp
void loop() {
  for (int i = 0; i <= 255; i++) { analogWrite(9, i); delay(5); }
  for (int i = 255; i >= 0; i--) { analogWrite(9, i); delay(5); }
}
```

人眼对亮度的感知是非线性的，想要更自然的呼吸效果可以使用 **伽马校正**：`analogWrite(9, pow(i / 255.0, 2.2) * 255)`。

## 平滑滤波

```cpp
const int N = 10;
long sum = 0;
for (int i = 0; i < N; i++) sum += analogRead(A0);
int avg = sum / N;
```

或者使用指数滑动平均：`smooth = smooth * 0.9 + raw * 0.1;`

## 相关项目

- [呼吸灯](/projects/breathing-led)
- [电位器调光 + 串口输出](/projects/potentiometer)
- [光控小夜灯](/projects/light-sensor)
