import type { ExampleProject } from '@mcu/shared'
import { circuit, part, wire, WIRE } from './helpers'

export const servo: ExampleProject = {
  id: 'servo',
  title: '舵机扫描（SG90）',
  summary: '让舵机在 0° ~ 180° 之间来回转动，理解舵机的 PWM 控制原理。',
  difficulty: 'intermediate',
  boardId: 'arduino-uno',
  tags: ['舵机', 'Servo 库', 'PWM', '需真实硬件'],
  articles: ['actuators', 'adc-pwm'],
  materials: [
    { materialId: 'arduino-uno', quantity: 1 },
    { materialId: 'sg90', quantity: 1 },
    { materialId: 'jumper-wires', quantity: 3 },
    { materialId: 'capacitor', quantity: 1, note: '可选：100μF 电解电容并在舵机电源两端' },
  ],
  wiring: [
    { from: '舵机棕线', to: 'GND' },
    { from: '舵机红线', to: '5V' },
    { from: '舵机橙线', to: 'D9' },
  ],
  guide: `## 原理

舵机内部有电机、减速齿轮、电位器和控制电路。它接收 **周期 20ms (50Hz)** 的 PWM 信号，用 **高电平宽度** 表示目标角度：

| 脉宽 | 角度 |
| --- | --- |
| 0.5 ms | 0° |
| 1.5 ms | 90° |
| 2.5 ms | 180° |

Arduino 自带的 **Servo 库** 封装好了这些时序，只需 write(角度)。

## 注意

- 舵机转动瞬间电流可达数百 mA，USB 供电可能导致开发板重启。出现这种情况请用外部 5V 电源给舵机供电，并与 Arduino **共地**。
- 不要用手强行掰舵机，容易打坏齿轮。

## 扩展练习

- 用电位器控制舵机角度（map(analogRead(A0), 0, 1023, 0, 180)）。
- 两个舵机组成云台。
`,
  code: String.raw`// 舵机扫描
#include <Servo.h>

Servo myServo;
const int SERVO_PIN = 9;

void setup() {
  myServo.attach(SERVO_PIN);
  Serial.begin(9600);
}

void loop() {
  for (int angle = 0; angle <= 180; angle += 2) {
    myServo.write(angle);
    delay(15);
  }
  Serial.println("到达 180°");
  for (int angle = 180; angle >= 0; angle -= 2) {
    myServo.write(angle);
    delay(15);
  }
  Serial.println("回到 0°");
}
`,
  circuit: circuit(
    [part('uno', 'board:arduino-uno', 0, 0), part('sv1', 'servo', 320, 140)],
    [
      wire('sv1:GND', 'uno:GND3', WIRE.ground),
      wire('sv1:VCC', 'uno:5V', WIRE.power),
      wire('sv1:SIG', 'uno:D9', WIRE.signal),
    ],
  ),
}
