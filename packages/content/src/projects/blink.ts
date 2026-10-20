import type { ExampleProject } from '@mcu/shared'
import { circuit, ledWithResistor, part } from './helpers'

const led = ledWithResistor({ board: 'uno', signalPin: 'D13', groundPin: 'GND3', index: 1, x: 300, y: 60 })

export const blink: ExampleProject = {
  id: 'blink',
  title: 'LED 闪烁（Hello World）',
  summary: '单片机界的 Hello World：让一颗 LED 每秒闪烁一次。',
  difficulty: 'beginner',
  boardId: 'arduino-uno',
  tags: ['GPIO', '数字输出', '可仿真'],
  articles: ['gpio-output', 'program-structure', 'ohms-law'],
  materials: [
    { materialId: 'arduino-uno', quantity: 1 },
    { materialId: 'led', quantity: 1, note: '任意颜色' },
    { materialId: 'resistor', quantity: 1, note: '220Ω' },
    { materialId: 'breadboard', quantity: 1 },
    { materialId: 'jumper-wires', quantity: 3 },
  ],
  wiring: [
    { from: 'Uno D13', to: '220Ω 电阻一端' },
    { from: '电阻另一端', to: 'LED 长脚（阳极 A）' },
    { from: 'LED 短脚（阴极 K）', to: 'Uno GND' },
  ],
  guide: `## 原理

D13 引脚输出 **高电平（5V）** 时，电流从 D13 → 电阻 → LED → GND 流过，LED 点亮；输出 **低电平（0V）** 时没有电流，LED 熄灭。

电阻的作用是 **限流**：LED 正向压降约 2V，(5V - 2V) / 220Ω ≈ 13.6mA，在 LED 安全范围内。

## 操作步骤

1. 点击「在工作台打开」，先点 **仿真运行**，观察电路图中的 LED 是否闪烁。
2. 按接线表在面包板上连好真实电路（不接外部 LED 也可以，Uno 板载的 L 灯就接在 D13 上）。
3. 选择串口，点击 **编译并烧录**。

## 扩展练习

- 把 delay 改成 100，看看闪烁速度的变化。
- 实现"SOS"摩尔斯电码：三短三长三短。
`,
  code: String.raw`// LED 闪烁：单片机的 Hello World
const int LED_PIN = 13;  // LED 接在 D13

void setup() {
  pinMode(LED_PIN, OUTPUT);  // 把引脚设置为输出模式
  Serial.begin(9600);
  Serial.println("Blink start!");
}

void loop() {
  digitalWrite(LED_PIN, HIGH);  // 输出高电平，LED 亮
  Serial.println("ON");
  delay(500);                   // 等待 500 毫秒

  digitalWrite(LED_PIN, LOW);   // 输出低电平，LED 灭
  Serial.println("OFF");
  delay(500);
}
`,
  circuit: circuit([part('uno', 'board:arduino-uno', 0, 0), ...led.parts], led.wires),
}
