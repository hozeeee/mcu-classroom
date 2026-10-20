import type { ExampleProject } from '@mcu/shared'
import { circuit, part, wire, WIRE } from './helpers'

export const ultrasonic: ExampleProject = {
  id: 'ultrasonic',
  title: '超声波测距（HC-SR04）',
  summary: '利用声波往返时间计算距离，掌握 pulseIn 测量脉宽。',
  difficulty: 'intermediate',
  boardId: 'arduino-uno',
  tags: ['传感器', 'pulseIn', '需真实硬件'],
  articles: ['sensors', 'timing-interrupt'],
  materials: [
    { materialId: 'arduino-uno', quantity: 1 },
    { materialId: 'hc-sr04', quantity: 1 },
    { materialId: 'jumper-wires', quantity: 4 },
  ],
  wiring: [
    { from: 'HC-SR04 VCC', to: '5V' },
    { from: 'HC-SR04 Trig', to: 'D9' },
    { from: 'HC-SR04 Echo', to: 'D10' },
    { from: 'HC-SR04 GND', to: 'GND' },
  ],
  guide: `## 原理

1. 单片机给 **Trig** 一个至少 10μs 的高电平脉冲。
2. 模块发出 8 个 40kHz 超声波，并把 **Echo** 拉高。
3. 收到回波后 Echo 变低。Echo 高电平持续的时间 = 声波往返时间。

距离(cm) = 时间(μs) × 0.0343 / 2（声速 343 m/s，除以 2 是因为往返）。

## 注意

- 测量面要平整且正对传感器，软质物体（衣服）吸收声波会测不准。
- pulseIn 第三个参数是超时时间，避免没有回波时程序卡死。
- ESP32 / Pico 等 3.3V 平台需要给 Echo 加分压电阻。

## 扩展练习

- 距离小于 10cm 时让蜂鸣器报警（倒车雷达）。
- 连续测 5 次取中位数，过滤异常值。
`,
  code: String.raw`// HC-SR04 超声波测距
const int TRIG_PIN = 9;
const int ECHO_PIN = 10;

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  Serial.begin(9600);
}

float measureCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);   // 发送 10us 触发脉冲
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  unsigned long duration = pulseIn(ECHO_PIN, HIGH, 30000);  // 超时 30ms
  if (duration == 0) return -1;   // 没有收到回波
  return duration * 0.0343 / 2;
}

void loop() {
  float distance = measureCm();
  if (distance < 0) {
    Serial.println("超出量程");
  } else {
    Serial.print("距离: ");
    Serial.print(distance, 1);
    Serial.println(" cm");
  }
  delay(200);
}
`,
  circuit: circuit(
    [part('uno', 'board:arduino-uno', 0, 0), part('us1', 'hcsr04', 320, 120)],
    [
      wire('us1:VCC', 'uno:5V', WIRE.power),
      wire('us1:TRIG', 'uno:D9', WIRE.signal),
      wire('us1:ECHO', 'uno:D10', WIRE.signal2),
      wire('us1:GND', 'uno:GND3', WIRE.ground),
    ],
  ),
}
