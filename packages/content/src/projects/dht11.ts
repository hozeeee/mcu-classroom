import type { ExampleProject } from '@mcu/shared'
import { circuit, part, wire, WIRE } from './helpers'

export const dht11: ExampleProject = {
  id: 'dht11',
  title: '温湿度监测（DHT11）',
  summary: '读取 DHT11 的温度与湿度并通过串口输出，第一次使用第三方库。',
  difficulty: 'intermediate',
  boardId: 'arduino-uno',
  tags: ['传感器', '第三方库', '单总线', '需真实硬件'],
  articles: ['sensors', 'libraries', 'serial-debug'],
  materials: [
    { materialId: 'arduino-uno', quantity: 1 },
    { materialId: 'dht11', quantity: 1, note: '3 针模块版' },
    { materialId: 'jumper-wires', quantity: 3, note: '公对母' },
  ],
  wiring: [
    { from: 'DHT11 VCC', to: '5V' },
    { from: 'DHT11 DATA', to: 'D2' },
    { from: 'DHT11 GND', to: 'GND' },
  ],
  guide: `## 准备

本项目需要安装库：在 **环境中心 → 库管理** 搜索并安装 **DHT sensor library**（作者 Adafruit），它依赖的 **Adafruit Unified Sensor** 会一并安装。

## 原理

DHT11 使用 **单总线协议**：一根数据线上，单片机先拉低至少 18ms 发出"开始信号"，传感器随后回传 40 位数据（湿度 16 位 + 温度 16 位 + 校验 8 位）。库帮我们处理了这些精确的时序。

## 注意

- DHT11 两次读取间隔 **至少 1 秒**，读太快会返回 NaN。
- 读数为 NaN 时说明通信失败：检查接线、上拉电阻（模块版自带）。

## 扩展练习

- 配合 OLED 屏做一个桌面温湿度计。
- 湿度超过 70% 时点亮报警 LED。
`,
  code: String.raw`// DHT11 温湿度监测
// 需安装库：DHT sensor library (Adafruit)
#include <DHT.h>

#define DHT_PIN 2
#define DHT_TYPE DHT11

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
  Serial.println("DHT11 ready");
}

void loop() {
  delay(2000);  // DHT11 采样间隔至少 1 秒

  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("读取失败，请检查接线！");
    return;
  }

  Serial.print("温度: ");
  Serial.print(temperature, 1);
  Serial.print(" °C   湿度: ");
  Serial.print(humidity, 0);
  Serial.println(" %");
}
`,
  circuit: circuit(
    [part('uno', 'board:arduino-uno', 0, 0), part('dht1', 'dht11', 320, 120)],
    [
      wire('dht1:VCC', 'uno:5V', WIRE.power),
      wire('dht1:DATA', 'uno:D2', WIRE.signal),
      wire('dht1:GND', 'uno:GND3', WIRE.ground),
    ],
  ),
}
