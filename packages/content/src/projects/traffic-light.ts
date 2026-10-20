import type { ExampleProject } from '@mcu/shared'
import { circuit, ledWithResistor, part, WIRE } from './helpers'

const red = ledWithResistor({ board: 'uno', signalPin: 'D10', groundPin: 'GND3', index: 1, x: 300, y: 20, color: 'red', wireColor: WIRE.signal })
const yellow = ledWithResistor({ board: 'uno', signalPin: 'D9', groundPin: 'GND3', index: 2, x: 300, y: 110, color: 'yellow', wireColor: WIRE.signal2 })
const green = ledWithResistor({ board: 'uno', signalPin: 'D8', groundPin: 'GND3', index: 3, x: 300, y: 200, color: 'green', wireColor: WIRE.signal3 })

export const trafficLight: ExampleProject = {
  id: 'traffic-light',
  title: '交通信号灯',
  summary: '用红黄绿三颗 LED 模拟十字路口的红绿灯，练习多路输出与时序控制。',
  difficulty: 'beginner',
  boardId: 'arduino-uno',
  tags: ['GPIO', '数字输出', '可仿真'],
  articles: ['gpio-output'],
  materials: [
    { materialId: 'arduino-uno', quantity: 1 },
    { materialId: 'led', quantity: 3, note: '红、黄、绿各一' },
    { materialId: 'resistor', quantity: 3, note: '220Ω' },
    { materialId: 'breadboard', quantity: 1 },
    { materialId: 'jumper-wires', quantity: 7 },
  ],
  wiring: [
    { from: 'D10', to: '220Ω → 红色 LED 阳极' },
    { from: 'D9', to: '220Ω → 黄色 LED 阳极' },
    { from: 'D8', to: '220Ω → 绿色 LED 阳极' },
    { from: '三颗 LED 阴极', to: 'GND（可以先接到面包板的蓝色负极轨）' },
  ],
  guide: `## 原理

每颗 LED 由一个独立的数字引脚控制。程序按 **绿灯 → 黄灯闪烁 → 红灯** 的顺序循环，本质就是"在正确的时间把正确的引脚置高"。

## 学习要点

- 用 **常量** 给引脚起名字，代码可读性更好。
- 把"点亮某一颗灯"封装成函数，避免重复代码。

## 扩展练习

- 增加一个行人按钮：按下后缩短绿灯时间。
- 改用 millis() 实现非阻塞版本（见《时间管理、非阻塞与中断》）。
`,
  code: String.raw`// 交通信号灯
const int RED = 10;
const int YELLOW = 9;
const int GREEN = 8;

void setOnly(int pin) {
  digitalWrite(RED, pin == RED ? HIGH : LOW);
  digitalWrite(YELLOW, pin == YELLOW ? HIGH : LOW);
  digitalWrite(GREEN, pin == GREEN ? HIGH : LOW);
}

void setup() {
  pinMode(RED, OUTPUT);
  pinMode(YELLOW, OUTPUT);
  pinMode(GREEN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  Serial.println("GREEN");
  setOnly(GREEN);
  delay(3000);

  Serial.println("YELLOW");
  for (int i = 0; i < 3; i++) {
    setOnly(YELLOW);
    delay(400);
    setOnly(-1);
    delay(400);
  }

  Serial.println("RED");
  setOnly(RED);
  delay(3000);
}
`,
  circuit: circuit(
    [part('uno', 'board:arduino-uno', 0, 0), ...red.parts, ...yellow.parts, ...green.parts],
    [...red.wires, ...yellow.wires, ...green.wires],
  ),
}
