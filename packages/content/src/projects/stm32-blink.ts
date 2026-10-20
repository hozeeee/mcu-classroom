import type { ExampleProject } from '@mcu/shared'
import { circuit, part, wire, WIRE } from './helpers'

export const stm32Blink: ExampleProject = {
  id: 'stm32-blink',
  title: 'STM32 点灯（Blue Pill）',
  summary: '用 ST-Link 给 STM32F103 烧录第一个程序，注意板载 LED 是低电平点亮。',
  difficulty: 'intermediate',
  boardId: 'stm32-bluepill',
  tags: ['STM32', 'ST-Link', 'SWD', '需真实硬件'],
  articles: ['stm32-intro', 'flashing', 'registers'],
  materials: [
    { materialId: 'stm32-bluepill', quantity: 1 },
    { materialId: 'st-link', quantity: 1 },
    { materialId: 'jumper-wires', quantity: 4, note: '母对母' },
  ],
  wiring: [
    { from: 'ST-Link 3.3V', to: 'Blue Pill 3.3' },
    { from: 'ST-Link SWDIO', to: 'Blue Pill DIO（SWD 排针）' },
    { from: 'ST-Link SWCLK', to: 'Blue Pill CLK（SWD 排针）' },
    { from: 'ST-Link GND', to: 'Blue Pill GND' },
  ],
  guide: `## 准备

1. 在 **环境中心** 安装 **STM32** 芯片核心。
2. 安装 ST 官方的 **STM32CubeProgrammer**（arduino-cli 通过它进行 SWD 烧录），并确保它在系统 PATH 中。
3. 按接线表连接 ST-Link，BOOT0 跳线保持 0。

## 低电平点亮？

Blue Pill 板载 LED 的电路是：**3.3V → 电阻 → LED → PC13**。只有 PC13 输出 **低电平** 时才有电流，所以 LOW 是亮、HIGH 是灭。这种接法叫 **灌电流**，在 STM32 中很常见。

## 进阶：寄存器写法

Arduino 风格的 digitalWrite 背后，其实是在写 GPIOC->ODR 寄存器。代码末尾的注释给出了等价的寄存器操作，感兴趣可以阅读《寄存器与底层编程》。

## 排错

- No STM32 target found：检查 SWD 接线；或按住 RESET 键开始烧录后松开。
- 若改用串口烧录：FQBN 中 upload_method 改为 serialMethod，BOOT0 跳到 1 并使用 USB-TTL 连接 PA9/PA10。
`,
  code: String.raw`// STM32 Blue Pill 点灯
// 板载 LED 在 PC13，低电平点亮
#define LED_PIN PC13

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  digitalWrite(LED_PIN, LOW);   // 亮
  delay(300);
  digitalWrite(LED_PIN, HIGH);  // 灭
  delay(700);
}

/*
 * 等价的寄存器写法（STM32F1）：
 *   RCC->APB2ENR |= RCC_APB2ENR_IOPCEN;         // 打开 GPIOC 时钟
 *   GPIOC->CRH = (GPIOC->CRH & ~(0xF << 20)) | (0x2 << 20); // PC13 推挽输出 2MHz
 *   GPIOC->BSRR = GPIO_BSRR_BR13;                // PC13 置低 -> LED 亮
 *   GPIOC->BSRR = GPIO_BSRR_BS13;                // PC13 置高 -> LED 灭
 */
`,
  circuit: circuit(
    [part('stm', 'board:stm32-bluepill', 0, 0), part('stlink', 'stlink', 360, 380)],
    [
      wire('stlink:3V3', 'stm:3V3_2', WIRE.power),
      wire('stlink:SWDIO', 'stm:PA13', WIRE.signal),
      wire('stlink:SWCLK', 'stm:PA14', WIRE.signal2),
      wire('stlink:GND', 'stm:GND2', WIRE.ground),
    ],
  ),
}
