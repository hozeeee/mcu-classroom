import type { ExampleProject } from '@mcu/shared'
import { circuit, ledWithResistor, part, wire, WIRE } from './helpers'

const led = ledWithResistor({ board: 'uno', signalPin: 'D13', groundPin: 'GND3', index: 1, x: 300, y: 40, color: 'white' })

export const lightSensor: ExampleProject = {
  id: 'light-sensor',
  title: '光控小夜灯',
  summary: '天黑自动亮灯、天亮自动关灯，带"迟滞"防止临界点反复闪烁。',
  difficulty: 'beginner',
  boardId: 'arduino-uno',
  tags: ['ADC', '传感器', '迟滞', '可仿真'],
  articles: ['sensors', 'adc-pwm'],
  materials: [
    { materialId: 'arduino-uno', quantity: 1 },
    { materialId: 'ldr-module', quantity: 1 },
    { materialId: 'led', quantity: 1 },
    { materialId: 'resistor', quantity: 1, note: '220Ω' },
    { materialId: 'jumper-wires', quantity: 6 },
  ],
  wiring: [
    { from: '光敏模块 VCC', to: '5V' },
    { from: '光敏模块 GND', to: 'GND' },
    { from: '光敏模块 AO', to: 'A0' },
    { from: 'D13', to: '220Ω → LED → GND' },
  ],
  guide: `## 原理

光敏电阻的阻值随光照变化，模块把它做成分压电路后从 AO 输出模拟电压。**常见模块光越强，AO 电压越低**（不同模块可能相反，先用串口打印看看）。

## 迟滞（Hysteresis）

如果只用一个阈值，光线刚好在阈值附近时灯会疯狂闪烁。解决办法是用两个阈值：

- 读数 > 700 才开灯（够暗）
- 读数 < 600 才关灯（够亮）

中间区域保持原状态。这是嵌入式里非常常用的技巧（空调温控也是这样）。

## 仿真提示

拖动光敏模块上的"光照"滑块模拟环境光变化。
`,
  code: String.raw`// 光控小夜灯（带迟滞）
const int LDR_PIN = A0;
const int LED_PIN = 13;
const int DARK_ON = 700;   // 高于该值认为天黑
const int LIGHT_OFF = 600; // 低于该值认为天亮

bool lightOn = false;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int value = analogRead(LDR_PIN);

  if (!lightOn && value > DARK_ON) {
    lightOn = true;
  } else if (lightOn && value < LIGHT_OFF) {
    lightOn = false;
  }
  digitalWrite(LED_PIN, lightOn ? HIGH : LOW);

  Serial.print("ldr=");
  Serial.print(value);
  Serial.print("  lamp=");
  Serial.println(lightOn ? "ON" : "OFF");
  delay(200);
}
`,
  circuit: circuit(
    [part('uno', 'board:arduino-uno', 0, 0), part('ldr1', 'ldr', 300, 230, { light: 70 }), ...led.parts],
    [
      wire('ldr1:VCC', 'uno:5V', WIRE.power),
      wire('ldr1:GND', 'uno:GND1', WIRE.ground),
      wire('ldr1:AO', 'uno:A0', WIRE.signal2),
      ...led.wires,
    ],
  ),
}
