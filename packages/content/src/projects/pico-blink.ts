import type { ExampleProject } from '@mcu/shared'
import { circuit, ledWithResistor, part } from './helpers'

const led = ledWithResistor({ board: 'pico', signalPin: 'GP15', groundPin: 'GND4', index: 1, x: 340, y: 360, color: 'green', ohms: 330 })

export const picoBlink: ExampleProject = {
  id: 'pico-blink',
  title: 'Pico 点灯 + 双核初体验',
  summary: '在树莓派 Pico 上同时闪烁板载 LED 与外接 LED，并体验 RP2040 的双核编程。',
  difficulty: 'intermediate',
  boardId: 'rpi-pico',
  tags: ['RP2040', 'UF2', '双核', '需真实硬件'],
  articles: ['pico-intro', 'flashing'],
  materials: [
    { materialId: 'rpi-pico', quantity: 1 },
    { materialId: 'led', quantity: 1 },
    { materialId: 'resistor', quantity: 1, note: '330Ω' },
    { materialId: 'breadboard', quantity: 1 },
    { materialId: 'jumper-wires', quantity: 2 },
  ],
  wiring: [
    { from: 'GP15', to: '330Ω → LED 阳极' },
    { from: 'LED 阴极', to: 'GND' },
  ],
  guide: `## 准备

1. 在 **环境中心** 安装 **RP2040** 芯片核心。
2. **首次烧录**：按住 Pico 上的 BOOTSEL 键再插入 USB，电脑会出现名为 RPI-RP2 的 U 盘。此时点"编译并烧录"，arduino-cli 会自动把 UF2 固件复制进去。
3. 之后再次烧录时一般无需再按 BOOTSEL。

## 双核

RP2040 有两个 Cortex-M0+ 内核。arduino-pico 核心中：

- setup() / loop() 运行在 **核心 0**
- setup1() / loop1() 运行在 **核心 1**

两个循环真正 **并行** 执行，各自 delay 互不影响——这与 JS 单线程事件循环完全不同。

## Pico W 注意

Pico W 的板载 LED 由无线芯片控制，不在 GP25，使用 LED_BUILTIN 常量即可兼容。
`,
  code: String.raw`// Pico 双核点灯
const int EXT_LED = 15;

// ---- 核心 0：板载 LED 慢闪 ----
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
  Serial.println("core0 tick");
}

// ---- 核心 1：外接 LED 快闪 ----
void setup1() {
  pinMode(EXT_LED, OUTPUT);
}

void loop1() {
  digitalWrite(EXT_LED, HIGH);
  delay(150);
  digitalWrite(EXT_LED, LOW);
  delay(150);
}
`,
  circuit: circuit([part('pico', 'board:rpi-pico', 0, 0), ...led.parts], led.wires),
}
