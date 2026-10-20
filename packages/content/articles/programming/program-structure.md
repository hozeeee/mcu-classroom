---
title: Arduino 程序结构
summary: setup() 与 loop() 是怎么被调用的？一个 .ino 文件编译后发生了什么？
difficulty: beginner
minutes: 10
tags: [setup, loop, 程序结构, 编译]
order: 2
---

## 最小程序

```cpp
void setup() {
  // 上电或复位后执行一次：初始化引脚、串口、传感器
}

void loop() {
  // setup() 结束后无限循环执行
}
```

Arduino 核心库中真正的 `main()` 大致是：

```cpp
int main() {
  init();          // 初始化定时器、ADC 等硬件
  setup();
  for (;;) {
    loop();
    serialEventRun();
  }
}
```

所以单片机程序 **永远不会"结束"**。没有操作系统可以返回，`loop()` 跑完一遍立刻开始下一遍。

## 与 JS 事件循环对比

| | Node.js | Arduino |
| --- | --- | --- |
| 启动 | 执行顶层代码 | `setup()` |
| 运行 | 事件循环等待回调 | `loop()` 不停轮询 |
| 等待 | `await sleep(1000)` 不阻塞其他任务 | `delay(1000)` **整个 CPU 停住** |
| 并发 | 异步 I/O | 中断，或自己用 `millis()` 实现"协作式多任务" |

## 推荐的代码组织

```cpp
// 1. 引入库
#include <Servo.h>

// 2. 常量：引脚定义、参数配置
const int LED_PIN = 13;
const unsigned long INTERVAL = 500;

// 3. 全局变量：需要在多次 loop 之间保持的状态
unsigned long lastToggle = 0;
bool ledOn = false;

// 4. setup：一次性初始化
void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

// 5. loop：保持简短，调用各个功能函数
void loop() {
  updateLed();
}

// 6. 功能函数
void updateLed() {
  if (millis() - lastToggle >= INTERVAL) {
    lastToggle = millis();
    ledOn = !ledOn;
    digitalWrite(LED_PIN, ledOn);
  }
}
```

## 编译时发生了什么

点击工作台的 **编译** 后，后端调用 `arduino-cli compile`：

1. **预处理**：把 `.ino` 转成 `.cpp`，自动加上 `#include <Arduino.h>` 和函数声明。
2. **编译**：avr-gcc 把 C++ 编译成 AVR 机器码（`.o` 文件）。
3. **链接**：与 Arduino 核心库、第三方库合并成 `.elf`。
4. **转换**：生成可烧录的 `.hex`（AVR）或 `.bin`（ESP32）/ `.uf2`（Pico）。
5. **报告大小**：

```
项目使用了 924 字节，占用了 (2%) 程序存储空间。最大为 32256 字节。
全局变量使用了 9 字节，(0%) 的动态内存，余留 2039 字节局部变量。最大为 2048 字节。
```

全局变量占用太多会导致运行时栈空间不足而崩溃，建议动态内存占用控制在 75% 以下。

## 多文件项目

Arduino 项目文件夹里可以放多个 `.ino`、`.h`、`.cpp` 文件。本站工作台目前是单文件编辑，适合学习；大项目可以用 PlatformIO。
