---
title: 串口通信与打印调试
summary: 单片机的 console.log：Serial.begin、print、println、读取串口输入，以及本站串口监视器的用法。
difficulty: beginner
minutes: 14
tags: [串口, Serial, 调试, 波特率]
order: 5
---

## 为什么需要串口

单片机没有屏幕、没有 DevTools。最常用的调试手段就是通过 **串口（UART）** 把信息发给电脑。

Uno 的 D0（RX）、D1（TX）连接着板上的 USB 转串口芯片，所以插上 USB 线就能和电脑通信。

## 基本用法

```cpp
void setup() {
  Serial.begin(9600);            // 波特率 9600
  Serial.println("启动完成");
}

void loop() {
  int value = analogRead(A0);
  Serial.print("A0 = ");
  Serial.println(value);         // 自动换行
  delay(500);
}
```

| 函数 | 作用 |
| --- | --- |
| `Serial.begin(baud)` | 初始化，波特率两端必须一致 |
| `Serial.print(x)` | 打印，不换行 |
| `Serial.println(x)` | 打印并换行 |
| `Serial.print(x, HEX)` | 以十六进制打印（还有 BIN、OCT） |
| `Serial.print(f, 2)` | 浮点数保留 2 位小数 |
| `Serial.available()` | 接收缓冲区里有多少字节 |
| `Serial.read()` | 读取一个字节 |
| `Serial.readStringUntil('\n')` | 读取一行 |

## 波特率

**波特率 = 每秒传输的位数**。常用 9600、115200。串口监视器的波特率必须与 `Serial.begin()` 一致，否则看到的是 **乱码**。

## 接收电脑发来的命令

```cpp
void loop() {
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();
    if (cmd == "on")  digitalWrite(13, HIGH);
    if (cmd == "off") digitalWrite(13, LOW);
  }
}
```

在本站串口监视器的输入框发送 `on` / `off` 即可控制 LED。

## 本站的串口工具

- **工作台底部面板**：仿真时显示虚拟串口输出；连接实物时显示真实串口数据。
- **[串口监视器](/serial) 页面**：独立的串口工具，支持选择端口、波特率、换行符、时间戳、HEX 显示。

> 烧录时串口会被占用。本站在烧录前会自动断开串口监视，烧录完成后再重新连接即可。

## 串口绘图

按 `值1,值2,值3` 的格式每行输出，可以用 Arduino IDE 的串口绘图器观察波形曲线，调试传感器非常直观。

## 调试技巧

1. 在 `setup()` 开头打印版本号，确认烧进去的是新程序。
2. 在关键分支打印标记，如 `Serial.println("进入状态 A")`。
3. 不要在中断函数中使用 `Serial.print`。
4. 打印太频繁会拖慢程序，必要时降低打印频率。
5. 更多方法见 [程序调试方法大全](/library/practice/debugging)。
