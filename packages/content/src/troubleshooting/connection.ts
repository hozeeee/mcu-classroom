import type { TroubleshootItem } from '@mcu/shared'

/** 驱动、端口、烧录相关问题 */
export const CONNECTION_ISSUES: TroubleshootItem[] = [
  {
    id: 'no-port',
    category: 'driver',
    title: '插上开发板后找不到串口',
    symptoms: ['工作台端口下拉为空', '设备管理器里出现带黄色感叹号的"未知设备"', 'ls /dev/tty* 没有新设备'],
    causes: [
      '使用了只能充电、没有数据线芯的 USB 线',
      '没有安装 USB 转串口芯片（CH340 / CP2102）的驱动',
      '开发板或 USB 口接触不良',
    ],
    solutions: [
      '换一根确认能传数据的 USB 线（能连接手机传文件的线）',
      '看开发板上 USB 口旁的芯片丝印：CH340 / CP2102，到"环境中心 → 驱动"安装对应驱动',
      '换一个 USB 口，尽量不要用 USB Hub',
      '插拔时观察板上电源灯是否亮起，不亮说明根本没有供电',
    ],
  },
  {
    id: 'linux-permission',
    category: 'driver',
    title: 'Linux 下提示 Permission denied: /dev/ttyUSB0',
    symptoms: ['烧录报 can\'t open device "/dev/ttyUSB0": Permission denied', '串口监视器无法打开'],
    causes: ['当前用户不在 dialout（Debian/Ubuntu）或 uucp（Arch）组中'],
    solutions: [
      '执行 sudo usermod -aG dialout $USER（Arch 用 uucp 组）',
      '注销后重新登录，或重启电脑使组权限生效',
      'Ubuntu 若有 brltty 抢占 CH340，可执行 sudo apt remove brltty',
    ],
    os: ['linux'],
  },
  {
    id: 'macos-ch340',
    category: 'driver',
    title: 'macOS 上 CH340 端口时有时无',
    symptoms: ['/dev/cu.wchusbserial* 不出现', '安装驱动后仍无法识别'],
    causes: ['系统未允许第三方驱动扩展加载', '旧版本驱动与新系统不兼容'],
    solutions: [
      '较新的 macOS 已内置 CH34x 驱动，端口名为 /dev/cu.usbserial-*，先不要装第三方驱动',
      '如安装了 WCH 官方驱动，需在"系统设置 → 隐私与安全性"中点击"允许"',
      '端口请选择 /dev/cu.* 而不是 /dev/tty.*',
    ],
    os: ['macos'],
  },
  {
    id: 'windows-com',
    category: 'driver',
    title: 'Windows 下 COM 口号变来变去 / 被占用',
    symptoms: ['烧录报 Access is denied', 'COM 口号每次插拔都不一样'],
    causes: ['串口被其他程序（如另一个串口助手、Arduino IDE）占用', 'Windows 为每个 USB 口分配不同 COM 号'],
    solutions: [
      '关闭其他打开了该串口的软件，本站烧录前会自动断开自身的串口监视',
      '固定使用同一个 USB 口，或在设备管理器中手动指定 COM 号',
    ],
    os: ['windows'],
  },
  {
    id: 'avr-not-in-sync',
    category: 'upload',
    title: 'Arduino 烧录报 avrdude: stk500_recv(): programmer is not responding',
    symptoms: ['stk500_getsync(): not in sync: resp=0x00', '烧录卡住后失败'],
    causes: [
      '选错了开发板型号（如 Nano 旧版 bootloader 应选 ATmega328P (Old Bootloader)）',
      '选错了端口',
      'D0/D1（RX/TX）上接了其他模块，干扰了烧录通信',
      '串口被串口监视器占用',
    ],
    solutions: [
      '核对开发板与端口，Nano 克隆版大多需要 old bootloader',
      '烧录时拔掉 D0/D1 上的连线',
      '先关闭串口监视器再烧录',
      '按一下板上 RESET 键后立即烧录',
    ],
  },
  {
    id: 'esp32-boot',
    category: 'upload',
    title: 'ESP32 烧录报 Failed to connect: Wrong boot mode detected',
    symptoms: ['Connecting........_____....._____ 后失败', 'A fatal error occurred: Failed to connect to ESP32'],
    causes: ['自动下载电路没能让芯片进入下载模式', 'GPIO0 / GPIO2 / GPIO12 上接了外设影响启动'],
    solutions: [
      '在出现 Connecting... 时按住板上 BOOT 键，看到开始写入后松开',
      '烧录时暂时断开 GPIO0 / GPIO2 / GPIO12 上的外接电路',
      '降低上传速率，换一根更短更好的 USB 线',
    ],
  },
  {
    id: 'stm32-stlink',
    category: 'upload',
    title: 'STM32 烧录报 No ST-Link detected / Target not found',
    symptoms: ['STM32CubeProgrammer 找不到 ST-Link', 'Error: No STM32 target found'],
    causes: ['ST-Link 驱动未安装', 'SWDIO/SWCLK 接反或接触不良', '未共地', '芯片被程序配置成禁用了 SWD 引脚'],
    solutions: [
      '确认已安装 STM32CubeProgrammer（arduino-cli 烧录 STM32 需要它）',
      '检查 4 根线：3V3、SWDIO、SWCLK、GND，一一对应',
      '按住开发板 RESET 键，点击烧录后松开（Connect under reset）',
      'Blue Pill 可将 BOOT0 跳线拨到 1 后上电，再烧录，完成后拨回 0',
    ],
  },
  {
    id: 'pico-uf2',
    category: 'upload',
    title: 'Pico 烧录提示找不到 RPI-RP2 磁盘',
    symptoms: ['No drive to deploy', '烧录长时间等待'],
    causes: ['开发板未处于 BOOTSEL 模式', '上一次程序崩溃导致无法自动重启进入下载模式'],
    solutions: [
      '拔掉 USB，按住 BOOTSEL 键再插入，电脑出现 RPI-RP2 磁盘后再烧录',
      'Linux 下确认 RPI-RP2 磁盘已被自动挂载',
    ],
  },
  {
    id: 'cli-not-installed',
    category: 'upload',
    title: '提示 arduino-cli 未安装 / 芯片核心未安装',
    symptoms: ['编译按钮提示需要先安装工具链', 'Error: platform not installed'],
    causes: ['首次使用，尚未下载编译工具链'],
    solutions: [
      '打开"环境中心"，点击"一键安装 arduino-cli"',
      '再为你使用的开发板安装对应的芯片核心（AVR / ESP32 / STM32 / RP2040）',
      '国内网络下载较慢时，可在 .env 中设置 MCU_ARDUINO_CLI_MIRROR 镜像地址，或配置系统代理',
    ],
  },
]
