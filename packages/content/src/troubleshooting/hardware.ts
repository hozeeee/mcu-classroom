import type { TroubleshootItem } from '@mcu/shared'

/** 电路与电源相关问题 */
export const HARDWARE_ISSUES: TroubleshootItem[] = [
  {
    id: 'led-not-on',
    category: 'circuit',
    title: 'LED 不亮',
    symptoms: ['程序烧录成功，但外接 LED 不亮'],
    causes: [
      'LED 接反：长脚（阳极 A）应接高电平一侧，短脚（阴极 C）接 GND',
      '面包板插错排，元件引脚没有真正连通',
      '代码里的引脚号与实际接线不一致',
      '忘记 pinMode(pin, OUTPUT)',
    ],
    solutions: [
      '把 LED 反过来插试试',
      '用万用表通断档确认每个连接点',
      '先用板载 LED（Uno 为 D13）验证程序逻辑',
    ],
  },
  {
    id: 'led-burned',
    category: 'circuit',
    title: 'LED 闪一下就灭了 / 发烫',
    symptoms: ['LED 非常亮后烧坏', 'LED 变黑'],
    causes: ['没有串联限流电阻，电流过大'],
    solutions: ['LED 必须串联 220Ω ~ 1kΩ 电阻，可以用"工具箱 → LED 限流电阻"计算', '本站电路编辑器会对未串电阻的 LED 给出警告'],
  },
  {
    id: 'button-random',
    category: 'circuit',
    title: '按键读数乱跳 / 不按也会触发',
    symptoms: ['digitalRead 结果在 0 和 1 之间随机变化', '手靠近就触发'],
    causes: ['输入引脚悬空（没有上拉或下拉），容易受干扰', '机械按键抖动'],
    solutions: [
      '使用 pinMode(pin, INPUT_PULLUP)，按键一端接引脚，另一端接 GND，按下读到 LOW',
      '软件消抖：检测到变化后延时 20ms 再确认一次',
    ],
  },
  {
    id: 'i2c-not-found',
    category: 'circuit',
    title: 'I2C 设备找不到（OLED / MPU6050 无响应）',
    symptoms: ['I2C 扫描不到任何地址', 'display.begin() 失败'],
    causes: ['SDA / SCL 接反', '地址不对（OLED 常见 0x3C 或 0x3D）', '模块供电电压不对'],
    solutions: [
      'Uno：SDA=A4、SCL=A5；ESP32：SDA=21、SCL=22；Pico：默认 GP4/GP5',
      '先运行 I2C Scanner 程序扫描真实地址',
      '确认模块 VCC 接 3.3V 还是 5V',
    ],
  },
  {
    id: 'board-reset',
    category: 'power',
    title: '接上电机/舵机后开发板不停重启',
    symptoms: ['舵机一动板子就复位', '串口反复打印启动信息', 'ESP32 报 Brownout detector was triggered'],
    causes: ['电机启动电流大，拉低了供电电压', 'USB 口供电能力有限（约 500mA）'],
    solutions: [
      '电机、舵机使用独立电源供电，并与开发板 **共地**',
      '在电源两端并联 100μF ~ 470μF 电解电容',
      '不要直接用 GPIO 驱动电机，应使用驱动模块（L298N / TB6612）',
    ],
  },
  {
    id: 'board-hot',
    category: 'power',
    title: '开发板芯片发烫 / 电脑提示 USB 过流',
    symptoms: ['稳压芯片烫手', '电脑弹出 USB 设备电涌提示'],
    causes: ['5V 与 GND 短路', 'VIN 接入过高电压', '3.3V 器件接到了 5V'],
    solutions: [
      '**立即断电**，检查是否有导线将 5V/3.3V 直接接到 GND',
      '检查面包板电源轨是否插错',
      '确认外部电源电压在开发板允许范围内（Uno VIN 7~12V）',
    ],
  },
  {
    id: 'esp32-5v-io',
    category: 'power',
    title: 'ESP32 / Pico 接 5V 传感器后工作异常',
    symptoms: ['读数不稳定', '芯片损坏'],
    causes: ['ESP32、STM32（部分引脚）、Pico 的 IO 是 3.3V 电平，不耐 5V'],
    solutions: ['使用 3.3V 供电的模块', '必须接 5V 模块时，加电平转换模块或电阻分压'],
  },
]
