import type { ExampleProject } from '@mcu/shared'
import { circuit, ledWithResistor, part, wire, WIRE } from './helpers'

const led = ledWithResistor({ board: 'uno', signalPin: 'D9', groundPin: 'GND3', index: 1, x: 300, y: 120, color: 'yellow' })

export const potentiometer: ExampleProject = {
  id: 'potentiometer',
  title: '电位器调光 + 串口输出',
  summary: '旋转电位器改变 LED 亮度，并把读数打印到串口监视器。',
  difficulty: 'beginner',
  boardId: 'arduino-uno',
  tags: ['ADC', 'PWM', '串口', '可仿真'],
  articles: ['adc-pwm', 'serial-debug'],
  materials: [
    { materialId: 'arduino-uno', quantity: 1 },
    { materialId: 'potentiometer', quantity: 1, note: '10kΩ' },
    { materialId: 'led', quantity: 1 },
    { materialId: 'resistor', quantity: 1, note: '220Ω' },
    { materialId: 'breadboard', quantity: 1 },
    { materialId: 'jumper-wires', quantity: 6 },
  ],
  wiring: [
    { from: '电位器左脚', to: '5V' },
    { from: '电位器中间脚', to: 'A0' },
    { from: '电位器右脚', to: 'GND' },
    { from: '~D9', to: '220Ω → LED 阳极，LED 阴极 → GND' },
  ],
  guide: `## 原理

电位器本质是一个 **分压器**：中间脚的电压随旋钮位置在 0 ~ 5V 之间变化。

analogRead(A0) 通过 10 位 ADC 把 0 ~ 5V 转成 **0 ~ 1023** 的整数；而 analogWrite 的范围是 **0 ~ 255**，所以用 map() 做一次映射。

## 操作

- 仿真时拖动电路图中电位器上的滑块，观察 LED 亮度和串口输出。
- 真实硬件烧录后打开串口监视器（波特率 9600）。

## 扩展练习

- 把读数换算成电压值打印：voltage = value * 5.0 / 1023。
- 用电位器控制 LED 的闪烁频率而不是亮度。
`,
  code: String.raw`// 电位器调光 + 串口输出
const int POT_PIN = A0;
const int LED_PIN = 9;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int raw = analogRead(POT_PIN);              // 0 ~ 1023
  int brightness = map(raw, 0, 1023, 0, 255); // 映射到 0 ~ 255
  analogWrite(LED_PIN, brightness);

  float voltage = raw * 5.0 / 1023.0;
  Serial.print("raw=");
  Serial.print(raw);
  Serial.print("  voltage=");
  Serial.print(voltage, 2);
  Serial.print("V  pwm=");
  Serial.println(brightness);
  delay(200);
}
`,
  circuit: circuit(
    [part('uno', 'board:arduino-uno', 0, 0), part('pot1', 'potentiometer', 300, 250, { value: 50 }), ...led.parts],
    [
      wire('pot1:VCC', 'uno:5V', WIRE.power),
      wire('pot1:SIG', 'uno:A0', WIRE.signal2),
      wire('pot1:GND', 'uno:GND1', WIRE.ground),
      ...led.wires,
    ],
  ),
}
