import type { ExampleProject } from '@mcu/shared'
import { circuit, ledWithResistor, part } from './helpers'

const led = ledWithResistor({ board: 'uno', signalPin: 'D9', groundPin: 'GND3', index: 1, x: 300, y: 120, color: 'blue' })

export const breathingLed: ExampleProject = {
  id: 'breathing-led',
  title: '呼吸灯（PWM）',
  summary: '让 LED 像呼吸一样渐亮渐暗，理解 PWM 如何"模拟"出不同亮度。',
  difficulty: 'beginner',
  boardId: 'arduino-uno',
  tags: ['PWM', 'analogWrite', '可仿真'],
  articles: ['adc-pwm'],
  materials: [
    { materialId: 'arduino-uno', quantity: 1 },
    { materialId: 'led', quantity: 1 },
    { materialId: 'resistor', quantity: 1, note: '220Ω' },
    { materialId: 'breadboard', quantity: 1 },
    { materialId: 'jumper-wires', quantity: 3 },
  ],
  wiring: [
    { from: '~D9（带波浪号的 PWM 引脚）', to: '220Ω → LED 阳极' },
    { from: 'LED 阴极', to: 'GND' },
  ],
  guide: `## 原理

单片机引脚只能输出 0V 或 5V，没法输出 2.5V。**PWM（脉冲宽度调制）** 的思路是：以很高的频率（Uno 约 490Hz）快速开关，通过改变"高电平所占的时间比例"（占空比）来控制平均电压。

| analogWrite 值 | 占空比 | 平均电压 |
| --- | --- | --- |
| 0 | 0% | 0V |
| 64 | 25% | 1.25V |
| 128 | 50% | 2.5V |
| 255 | 100% | 5V |

人眼看不出 490Hz 的闪烁，只会感觉到亮度变化。

## 注意

只有带 **~** 标记的引脚（Uno 上是 3、5、6、9、10、11）支持 analogWrite。

## 扩展练习

- 用两颗 LED 做"此消彼长"的效果。
- 用正弦函数 sin() 让呼吸更自然。
`,
  code: String.raw`// 呼吸灯：PWM 调节 LED 亮度
const int LED_PIN = 9;  // 必须是 PWM 引脚

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  for (int value = 0; value <= 255; value += 5) {   // 渐亮
    analogWrite(LED_PIN, value);
    delay(20);
  }
  for (int value = 255; value >= 0; value -= 5) {   // 渐暗
    analogWrite(LED_PIN, value);
    delay(20);
  }
}
`,
  circuit: circuit([part('uno', 'board:arduino-uno', 0, 0), ...led.parts], led.wires),
}
