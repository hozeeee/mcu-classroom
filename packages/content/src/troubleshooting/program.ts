import type { TroubleshootItem } from '@mcu/shared'

/** 编译、串口、仿真相关问题 */
export const PROGRAM_ISSUES: TroubleshootItem[] = [
  {
    id: 'missing-semicolon',
    category: 'compile',
    title: '编译报 expected \';\' before ...',
    symptoms: ['error: expected \';\' before \'}\' token'],
    causes: ['C/C++ 语句必须以分号结尾，JS 开发者最容易忘'],
    solutions: ['看报错行号的 **上一行** 是否少了分号', '大括号、圆括号是否成对'],
  },
  {
    id: 'not-declared',
    category: 'compile',
    title: '编译报 \'xxx\' was not declared in this scope',
    symptoms: ['error: \'ledPin\' was not declared in this scope'],
    causes: ['变量/函数拼写错误（区分大小写）', '变量定义在别的函数内部，作用域不可见', '使用了库却没有 #include'],
    solutions: [
      '检查拼写和大小写，例如 digitalwrite 应为 digitalWrite',
      '需要多处使用的变量定义在函数外（全局）',
      '使用第三方库要在顶部 #include，并在"环境中心 → 库管理"安装该库',
    ],
  },
  {
    id: 'no-such-file',
    category: 'compile',
    title: '编译报 fatal error: xxx.h: No such file or directory',
    symptoms: ['fatal error: DHT.h: No such file or directory'],
    causes: ['所需的第三方库没有安装'],
    solutions: ['到"环境中心 → 库管理"搜索并安装该库（例如 DHT sensor library）', '安装后重新编译'],
  },
  {
    id: 'sketch-too-big',
    category: 'compile',
    title: '编译报 Sketch too big / 内存不足',
    symptoms: ['Sketch too big', 'Low memory available, stability problems may occur'],
    causes: ['程序或字符串常量太多，超出 Flash 32KB / SRAM 2KB（Uno）'],
    solutions: [
      '用 F("文字") 宏把 Serial.print 的字符串放到 Flash 中',
      '减小数组大小，避免使用 String 类大量拼接',
      '资源紧张时换用 ESP32 / Pico 等更大内存的芯片',
    ],
  },
  {
    id: 'serial-garbled',
    category: 'serial',
    title: '串口监视器输出乱码',
    symptoms: ['看到一堆 ?? 或奇怪字符'],
    causes: ['串口监视器波特率与程序中 Serial.begin() 的参数不一致', 'ESP32 上电时会以 115200 输出启动日志'],
    solutions: ['把串口监视器的波特率调成与代码一致（如 9600 或 115200）', 'ESP32 建议统一使用 115200'],
  },
  {
    id: 'serial-nothing',
    category: 'serial',
    title: '串口监视器没有任何输出',
    symptoms: ['打开串口后一片空白'],
    causes: ['代码中没有调用 Serial.begin()', '选错端口', 'ESP32-C3/S3 等原生 USB 板需开启 USB CDC On Boot'],
    solutions: [
      '确认 setup() 中有 Serial.begin(波特率)',
      '按一下开发板 RESET 键，从头看输出',
      '原生 USB 的板子在 FQBN 中加 CDCOnBoot=cdc',
    ],
  },
  {
    id: 'sim-unsupported',
    category: 'simulator',
    title: '仿真器提示该开发板不支持仿真',
    symptoms: ['仿真按钮为灰色'],
    causes: ['浏览器仿真目前只支持 Arduino Uno（ATmega328P）'],
    solutions: ['ESP32 / STM32 / Pico 项目请连接真实硬件烧录运行', '先用 Uno 仿真把逻辑验证清楚，再移植到其他芯片'],
  },
  {
    id: 'sim-sensor',
    category: 'simulator',
    title: '仿真里 DHT11 / 超声波 / OLED 没有反应',
    symptoms: ['读数一直为 0 或 NaN', 'OLED 不显示'],
    causes: ['仿真器只模拟了 GPIO、PWM、ADC 与串口，未模拟这些复杂时序外设'],
    solutions: ['这类项目标注了"需真实硬件"，请烧录到实物验证', '可在仿真中用电位器/光敏电阻代替传感器先调逻辑'],
  },
  {
    id: 'sim-needs-compile',
    category: 'simulator',
    title: '仿真运行的是旧代码',
    symptoms: ['改了代码但仿真行为没变'],
    causes: ['仿真使用的是上一次编译出的 HEX 固件'],
    solutions: ['修改代码后先点"编译"，再点"运行仿真"（工作台会提示固件已过期）'],
  },
]
