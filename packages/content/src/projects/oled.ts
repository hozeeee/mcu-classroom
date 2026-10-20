import type { ExampleProject } from '@mcu/shared'
import { circuit, part, wire, WIRE } from './helpers'

export const oled: ExampleProject = {
  id: 'oled',
  title: 'OLED 显示（SSD1306）',
  summary: '在 0.96 寸 OLED 上显示文字和运行时间，入门 I2C 设备。',
  difficulty: 'intermediate',
  boardId: 'arduino-uno',
  tags: ['I2C', '显示', '第三方库', '需真实硬件'],
  articles: ['i2c', 'displays', 'libraries'],
  materials: [
    { materialId: 'arduino-uno', quantity: 1 },
    { materialId: 'oled-ssd1306', quantity: 1, note: '4 针 I2C 版' },
    { materialId: 'jumper-wires', quantity: 4 },
  ],
  wiring: [
    { from: 'OLED GND', to: 'GND' },
    { from: 'OLED VCC', to: '5V' },
    { from: 'OLED SCL', to: 'A5 (SCL)' },
    { from: 'OLED SDA', to: 'A4 (SDA)' },
  ],
  guide: `## 准备

在 **环境中心 → 库管理** 安装 **Adafruit SSD1306** 与 **Adafruit GFX Library**。

## 原理

I2C 只需两根线：**SCL**（时钟）和 **SDA**（数据），多个设备通过 **地址** 区分。SSD1306 的地址通常是 **0x3C**（少数为 0x3D）。

Uno 的 I2C 引脚固定为 A4 (SDA) / A5 (SCL)；ESP32 默认为 GPIO21 / GPIO22。

## 排错

- 屏幕不亮：先跑一个 **I2C 扫描** 程序确认地址。
- 编译提示内存不足：SSD1306 帧缓冲占 1KB，Uno 只有 2KB RAM，少用 String 和大数组。

## 扩展练习

- 显示 DHT11 的温湿度。
- 画一个随电位器变化的进度条（fillRect）。
`,
  code: String.raw`// OLED 显示
// 需安装库：Adafruit SSD1306、Adafruit GFX Library
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_ADDR 0x3C

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

void setup() {
  Serial.begin(9600);
  if (!display.begin(SSD1306_SWITCHCAPVCC, OLED_ADDR)) {
    Serial.println(F("SSD1306 初始化失败，检查接线与地址"));
    while (true) {}
  }
  display.clearDisplay();
  display.setTextColor(SSD1306_WHITE);
}

void loop() {
  display.clearDisplay();

  display.setTextSize(2);
  display.setCursor(0, 0);
  display.println(F("Hello MCU"));

  display.setTextSize(1);
  display.setCursor(0, 32);
  display.print(F("Uptime: "));
  display.print(millis() / 1000);
  display.println(F(" s"));

  display.drawRect(0, 50, 128, 12, SSD1306_WHITE);
  display.fillRect(2, 52, (millis() / 100) % 124, 8, SSD1306_WHITE);

  display.display();
  delay(100);
}
`,
  circuit: circuit(
    [part('uno', 'board:arduino-uno', 0, 0), part('oled1', 'oled', 320, 200)],
    [
      wire('oled1:GND', 'uno:GND1', WIRE.ground),
      wire('oled1:VCC', 'uno:5V', WIRE.power),
      wire('oled1:SCL', 'uno:A5', WIRE.signal2),
      wire('oled1:SDA', 'uno:A4', WIRE.signal3),
    ],
  ),
}
