---
title: 写给 JS 开发者的 C/C++ 速成
summary: 对照 JavaScript 学 Arduino C++：类型、数组、字符串、函数、指针、内存，只讲单片机里用得到的部分。
difficulty: beginner
minutes: 30
tags: [C++, 语法, 类型, 指针, JavaScript 对照]
order: 1
---

Arduino 程序（`.ino`）就是 **C++**，只是自动帮你 `#include <Arduino.h>` 并生成了 `main()`。

## 变量与类型

JS 是动态类型，C++ 是 **静态类型**，必须声明类型：

```cpp
int count = 0;           // let count = 0
float temp = 23.5;       // let temp = 23.5
bool isOn = true;        // let isOn = true
char letter = 'A';       // 单个字符用单引号！
const int LED_PIN = 13;  // const LED_PIN = 13
```

### 整数类型的大小很重要

| 类型 | AVR（Uno）大小 | 范围 | 说明 |
| --- | --- | --- | --- |
| `bool` | 1 字节 | true / false | |
| `byte` / `uint8_t` | 1 字节 | 0 ~ 255 | 最省内存 |
| `int` / `int16_t` | **2 字节** | -32768 ~ 32767 | ⚠️ ESP32 上是 4 字节 |
| `unsigned int` | 2 字节 | 0 ~ 65535 | |
| `long` / `int32_t` | 4 字节 | ±21 亿 | |
| `unsigned long` | 4 字节 | 0 ~ 42 亿 | `millis()` 的返回值 |
| `float` / `double` | 4 字节 | 约 7 位有效数字 | AVR 上 double 等于 float |

**溢出陷阱**：

```cpp
int a = 30000;
a = a + 10000;           // 结果是 -25536，不是 40000！
```

> 建议使用 `<stdint.h>` 的精确类型（`uint8_t`、`int16_t`、`uint32_t`），代码在不同芯片上行为一致。

### 整数除法

```cpp
int x = 5 / 2;           // 2，不是 2.5
float y = 5 / 2;         // 2.0，右边先按整数算
float z = 5.0 / 2;       // 2.5 ✅
```

## 数组

```cpp
int pins[3] = {9, 10, 11};       // const pins = [9, 10, 11]
int len = sizeof(pins) / sizeof(pins[0]);  // 没有 .length！
for (int i = 0; i < len; i++) {
  pinMode(pins[i], OUTPUT);
}
```

- 数组 **长度固定**，没有 `push` / `map` / `filter`。
- **越界不会报错**，会悄悄读写到别的内存，导致诡异 bug。

## 字符串

两种字符串：

```cpp
char name[] = "Arduino";          // C 字符串：字符数组，以 '\0' 结尾
String msg = "Hello " + String(42); // Arduino String 类：像 JS 字符串，但会动态分配内存
```

在 2KB 内存的 Uno 上频繁拼接 `String` 会导致 **内存碎片**，程序运行一段时间后崩溃。打印时可以分多次 `Serial.print`：

```cpp
Serial.print("温度: ");
Serial.print(temp);
Serial.println(" ℃");
```

## 函数

```cpp
// 返回类型 函数名(参数类型 参数名)
int add(int a, int b) {
  return a + b;
}

void blinkLed(int pin, int times) {   // void = 无返回值
  for (int i = 0; i < times; i++) { /* ... */ }
}
```

- 没有箭头函数（C++11 有 lambda，但很少用）。
- 没有默认的闭包和回调地狱；中断回调必须是普通函数。
- Arduino 会自动生成函数声明，所以函数可以写在 `loop()` 之后。

## 控制流

和 JS 几乎一样：`if / else`、`for`、`while`、`switch`、`break`、`continue`、三元运算符 `? :`。区别：

- 没有 `===`，只有 `==`。
- `if (x = 5)` 是赋值不是比较！编译器会给警告。
- `switch` 只能用于整数和字符。

## 结构体：类似 JS 对象

```cpp
struct Reading {
  float temperature;
  float humidity;
};

Reading r = {23.5, 60.0};
Serial.println(r.temperature);
```

## 指针与引用（了解即可）

```cpp
int value = 10;
int* p = &value;      // p 存的是 value 的内存地址
*p = 20;              // 通过地址修改，value 变成 20

void reset(int& v) {  // 引用参数：函数内修改会影响外部变量
  v = 0;
}
```

JS 里对象是"引用传递"、数字是"值传递"；C++ 默认 **全部值传递**，想要修改外部变量就用引用 `&` 或指针 `*`。

## 预处理器

```cpp
#include <Servo.h>       // import Servo from 'servo'
#define LED_PIN 13       // 文本替换，现代写法推荐 const int
```

## 内存：栈、堆、Flash

- 局部变量放在 **栈**，函数返回即释放。
- `new` / `malloc` / `String` 使用 **堆**，在单片机上尽量避免。
- 常量字符串可以用 `F("...")` 放到 Flash：`Serial.println(F("很长的提示文字"));`

## 速查对照

| JavaScript | Arduino C++ |
| --- | --- |
| `console.log(x)` | `Serial.println(x)` |
| `setTimeout(fn, 1000)` | `delay(1000)`（阻塞）或 `millis()` 计时 |
| `setInterval` | 在 `loop()` 中用 `millis()` 判断 |
| `Math.random()` | `random(min, max)` |
| `Math.max/min` | `max()` / `min()` / `constrain()` |
| `parseInt(str)` | `str.toInt()` / `atoi()` |
| `JSON.stringify` | ArduinoJson 库 |
| `import` | `#include` |
| `npm install` | 库管理器安装 |
