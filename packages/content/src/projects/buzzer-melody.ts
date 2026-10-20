import type { ExampleProject } from '@mcu/shared'
import { circuit, part, wire, WIRE } from './helpers'

export const buzzerMelody: ExampleProject = {
  id: 'buzzer-melody',
  title: '蜂鸣器播放《小星星》',
  summary: '用 tone() 驱动无源蜂鸣器演奏旋律，理解频率与音高的关系。',
  difficulty: 'beginner',
  boardId: 'arduino-uno',
  tags: ['tone', '无源蜂鸣器', '数组', '可仿真'],
  articles: ['actuators', 'adc-pwm'],
  materials: [
    { materialId: 'arduino-uno', quantity: 1 },
    { materialId: 'buzzer', quantity: 1, note: '无源蜂鸣器' },
    { materialId: 'jumper-wires', quantity: 2 },
  ],
  wiring: [
    { from: 'D8', to: '蜂鸣器正极 (+)' },
    { from: '蜂鸣器负极 (-)', to: 'GND' },
  ],
  guide: `## 原理

声音的音高由 **振动频率** 决定。tone(pin, 频率) 让引脚输出指定频率的方波，无源蜂鸣器随之振动发声：

| 音符 | Do | Re | Mi | Fa | Sol | La | Si |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 频率 (Hz) | 262 | 294 | 330 | 349 | 392 | 440 | 494 |

## 有源 vs 无源

- **有源** 蜂鸣器内部有振荡电路，通电就响，只能发一个固定音。
- **无源** 蜂鸣器需要外部提供方波，才能演奏不同音高。

## 仿真提示

仿真时电路图中的蜂鸣器会显示当前检测到的频率。

## 扩展练习

- 加一个按键，按下才开始播放。
- 换一首你喜欢的歌（查简谱 → 频率表）。
`,
  code: String.raw`// 蜂鸣器播放《小星星》
const int BUZZER_PIN = 8;

// 音符频率
#define C4 262
#define D4 294
#define E4 330
#define F4 349
#define G4 392
#define A4 440

int melody[] = { C4, C4, G4, G4, A4, A4, G4, F4, F4, E4, E4, D4, D4, C4 };
int beats[]  = { 1,  1,  1,  1,  1,  1,  2,  1,  1,  1,  1,  1,  1,  2  };
const int NOTE_COUNT = sizeof(melody) / sizeof(melody[0]);

void setup() {
  Serial.begin(9600);
}

void loop() {
  for (int i = 0; i < NOTE_COUNT; i++) {
    int duration = 300 * beats[i];
    Serial.print("note ");
    Serial.println(melody[i]);
    tone(BUZZER_PIN, melody[i], duration);
    delay(duration * 1.3);  // 音符之间留一点间隔
  }
  noTone(BUZZER_PIN);
  delay(2000);
}
`,
  circuit: circuit(
    [part('uno', 'board:arduino-uno', 0, 0), part('bz1', 'buzzer', 320, 160)],
    [wire('uno:D8', 'bz1:P', WIRE.signal), wire('bz1:N', 'uno:GND3', WIRE.ground)],
  ),
}
