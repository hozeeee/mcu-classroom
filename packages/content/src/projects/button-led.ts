import type { ExampleProject } from '@mcu/shared'
import { circuit, ledWithResistor, part, wire, WIRE } from './helpers'

const led = ledWithResistor({ board: 'uno', signalPin: 'D13', groundPin: 'GND3', index: 1, x: 300, y: 40 })

export const buttonLed: ExampleProject = {
  id: 'button-led',
  title: '按键开关灯',
  summary: '按一下灯亮，再按一下灯灭。学习数字输入、内部上拉与按键消抖。',
  difficulty: 'beginner',
  boardId: 'arduino-uno',
  tags: ['GPIO', '数字输入', '消抖', '可仿真'],
  articles: ['gpio-input', 'pull-up-down'],
  materials: [
    { materialId: 'arduino-uno', quantity: 1 },
    { materialId: 'button', quantity: 1 },
    { materialId: 'led', quantity: 1 },
    { materialId: 'resistor', quantity: 1, note: '220Ω' },
    { materialId: 'breadboard', quantity: 1 },
    { materialId: 'jumper-wires', quantity: 5 },
  ],
  wiring: [
    { from: 'D2', to: '按键一端' },
    { from: '按键另一端', to: 'GND', note: '使用内部上拉，无需外接电阻' },
    { from: 'D13', to: '220Ω → LED 阳极，LED 阴极 → GND' },
  ],
  guide: `## 原理

pinMode(2, INPUT_PULLUP) 打开芯片 **内部上拉电阻**：

- 按键松开：引脚被上拉到 5V，读到 **HIGH**
- 按键按下：引脚直接接地，读到 **LOW**

所以"按下 = LOW"，这和直觉相反，初学者一定要记住。

## 为什么要消抖？

机械按键在按下的瞬间会产生几毫秒的 **抖动**（快速通断多次），不处理的话按一次可能被识别成好几次。代码中检测到状态变化后等待 30ms 再确认。

## 仿真提示

仿真运行时，**点击电路图中的按键** 即可模拟按下。

## 扩展练习

- 改成"长按 1 秒才切换"。
- 用 attachInterrupt 中断方式实现（见《时间管理、非阻塞与中断》）。
`,
  code: String.raw`// 按键开关灯（带消抖）
const int BUTTON_PIN = 2;
const int LED_PIN = 13;

bool ledOn = false;
int lastReading = HIGH;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);  // 内部上拉：松开=HIGH，按下=LOW
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  int reading = digitalRead(BUTTON_PIN);

  if (reading != lastReading) {
    delay(30);                         // 消抖：等待抖动结束
    reading = digitalRead(BUTTON_PIN);
    if (reading != lastReading) {
      lastReading = reading;
      if (reading == LOW) {            // 按下的那一刻
        ledOn = !ledOn;
        digitalWrite(LED_PIN, ledOn ? HIGH : LOW);
        Serial.print("LED: ");
        Serial.println(ledOn ? "ON" : "OFF");
      }
    }
  }
}
`,
  circuit: circuit(
    [
      part('uno', 'board:arduino-uno', 0, 0),
      part('btn1', 'button', 320, 260),
      ...led.parts,
    ],
    [
      wire('uno:D2', 'btn1:1', WIRE.signal2),
      wire('btn1:2', 'uno:GND3', WIRE.ground),
      ...led.wires,
    ],
  ),
}
