---
title: ESP32 入门
summary: ESP32 家族（经典款 / S3 / C3 / C6…）的区别与型号读法、引脚注意事项、开发方式、烧录流程，以及从 Arduino Uno 迁移时的差异。
difficulty: intermediate
minutes: 25
tags: [ESP32, ESP32-S3, ESP32-C3, 乐鑫, 模组, 选型, WiFi, 蓝牙, 3.3V]
order: 2
---

## ESP32 是什么

乐鑫（Espressif）出品的 WiFi + 蓝牙 SoC，物联网领域的明星芯片。

"ESP32"这个词有两层意思：狭义上指 2016 年发布的 **经典款 ESP32 芯片**；广义上指整个 **ESP32 家族**（S2、S3、C3、C6……）。本站内置的 ESP32 DevKit 用的是经典款，参数如下：

| 项目 | 经典 ESP32（ESP32-WROOM-32 模组） |
| --- | --- |
| CPU | Xtensa LX6 双核 240MHz |
| SRAM | 520KB |
| Flash | 4MB（外置） |
| 无线 | WiFi 802.11 b/g/n、蓝牙 4.2 + BLE |
| GPIO | 34 个 |
| ADC | 18 通道 12 位 |
| DAC | 2 通道 8 位 |
| 其他 | 电容触摸、霍尔传感器、硬件加密、RTC |
| 电压 | **3.3V**（IO 不耐 5V） |

## 芯片、模组、开发板

买 ESP32 时，商品标题里往往同时出现三种名字，它们是 **三个层级**（通用概念见 [看懂芯片型号](/library/start/chip-models)）：

| 芯片（SoC） | 模组（Module） | 开发板（Dev Board） |
| --- | --- | --- |
| ESP32-D0WD-V3 | ESP32-WROOM-32E | ESP32-DevKitC / ESP32 DevKit V1 |
| ESP32-S3 | ESP32-S3-WROOM-1-N16R8 | ESP32-S3-DevKitC-1 |
| ESP32-C3 | ESP32-C3-MINI-1 | ESP32-C3-DevKitM-1 |

- **芯片**：只有 CPU、内存、射频，大多数型号 **没有内置 Flash**，不能单独工作。
- **模组**：芯片 + Flash（+ PSRAM）+ 晶振 + 天线，封在银色金属屏蔽罩里，**屏蔽罩上印的就是模组型号**。
- **开发板**：模组 + USB 转串口芯片 + 稳压 + BOOT/EN 按键 + 排针。

所以 **ESP32-WROOM-32 和 ESP32-S3 不是同一层的东西**：前者是用经典 ESP32 芯片做的模组，后者是另一个芯片系列。它们是同一家族的"兄弟"，不是同一型号的新旧版本——内核、引脚、外设都不同。

> 有些迷你板（如 ESP32-C3 SuperMini）直接使用内置 Flash 的芯片（ESP32-C3FN4），没有模组那层铁壳，属于正常情况。

## ESP32 家族对比

| 系列 | 内核 | 无线 | 原生 USB | 特点 / 典型用途 |
| --- | --- | --- | --- | --- |
| **ESP32**（经典） | Xtensa LX6 双核 240MHz | WiFi 4 + **经典蓝牙** + BLE 4.2 | 无（靠板载 USB 转串口芯片） | 资料最多；家族里 **唯一支持经典蓝牙**（蓝牙音箱 A2DP、蓝牙串口 SPP）；有 DAC |
| ESP32-S2 | Xtensa LX7 单核 240MHz | 仅 WiFi 4，**无蓝牙** | USB OTG | 过渡型号，现在较少用 |
| **ESP32-S3** | Xtensa LX7 双核 240MHz | WiFi 4 + BLE 5 | USB OTG + USB 串口/JTAG | AI 向量指令、可配 8MB PSRAM、摄像头/屏幕接口；做 AI 识别、带屏项目、USB 键鼠首选 |
| ESP32-C2 | RISC-V 单核 120MHz | WiFi 4 + BLE 5 | 无 | 极低成本，资源少 |
| **ESP32-C3** | RISC-V 单核 160MHz | WiFi 4 + BLE 5 | USB 串口/JTAG | 便宜小巧，简单联网控制 |
| ESP32-C6 | RISC-V 160MHz（+ 低功耗核） | **WiFi 6** + BLE 5 + Zigbee/Thread | USB 串口/JTAG | 智能家居、Matter |
| ESP32-C5 | RISC-V 240MHz | **双频 WiFi 6（2.4G + 5G）** + BLE 5 + Zigbee/Thread | USB 串口/JTAG | 需要 5GHz WiFi 时 |
| ESP32-H2 | RISC-V 96MHz | **无 WiFi**，BLE 5 + Zigbee/Thread | USB 串口/JTAG | Zigbee/Thread 传感器节点 |
| ESP32-P4 | RISC-V 双核 400MHz | **无无线** | USB 2.0 高速 OTG | 高性能多媒体/大屏，常搭配 C6 负责联网 |

记忆方法：**无字母 = 经典款；S = Xtensa 内核的升级线；C = RISC-V 内核、主打性价比和连接；H = 不带 WiFi 的 Zigbee/Thread；P = 不带无线的高性能**。不同字母之间是"定位不同"而不是"高低之分"，比如 C6 并不比 S3 "高级"。

> **ESP8266** 是 ESP32 的前辈（单核 80MHz、只有 WiFi、IO 很少），不属于 ESP32 家族。老教程很多，但新项目建议直接用 ESP32 或 ESP32-C3。

## 型号怎么读

### 模组型号（最常看到）

```
ESP32-S3 - WROOM - 1 U - N16 R8
   │        │     │ │    │   └ PSRAM：R8 = 8MB（没有 R 就是无 PSRAM）
   │        │     │ │    └──── Flash：N16 = 16MB（H 开头表示高温版，如 H4）
   │        │     │ └───────── U = 外接天线座（IPEX），无 U = 板载 PCB 天线
   │        │     └─────────── 模组版本号
   │        └───────────────── 模组形态：WROOM = 标准尺寸，MINI = 小尺寸，WROVER = 经典款的带 PSRAM 加长版
   └────────────────────────── 芯片系列
```

经典款的模组名稍有不同，以 `-32` 结尾：

| 模组 | 区别 |
| --- | --- |
| ESP32-WROOM-32 | 初代，官方已不推荐新设计使用 |
| ESP32-WROOM-32D | 换用 D0WD 芯片 |
| ESP32-WROOM-32**E** | 使用 **V3 版芯片**（修复了早期硬件 bug），**现在买优先选 E** |
| ESP32-WROOM-32U / 32UE | 外接天线版本 |
| ESP32-WROVER-E | 模组内带 PSRAM，适合需要大内存的经典款项目 |

> ⚠️ 名字撞车：**安信可（Ai-Thinker）的 ESP-32S / ESP32-S 模组里装的是经典 ESP32**，和乐鑫的 ESP32-S2/S3 系列没有关系。NodeMCU-32S、ESP32-CAM 用的都是它。

### 芯片型号（了解即可）

经典款：`ESP32-D0WD-V3` → **D** = 双核（S = 单核），**0** = 芯片内无 Flash，**WD** = WiFi + 双模蓝牙，**V3** = 第 3 版硬件。

新系列：`ESP32-S3FN8`、`ESP32-S3R8`、`ESP32-C3FN4` → **F** = 芯片内置 Flash，**N / H** = 常温 / 高温版，后面数字 = 容量（MB）；**R** = 芯片内置 PSRAM。

### 常见开发板名

| 开发板 | 里面是什么 |
| --- | --- |
| ESP32-DevKitC | 乐鑫官方经典款开发板（WROOM-32E 等） |
| ESP32 DevKit V1（DOIT） | 第三方经典款开发板，分 30 Pin / 38 Pin，**本站内置的就是 30 Pin 版** |
| ESP32-S3-DevKitC-1 | 官方 S3 板，**有两个 USB 口**：标 UART 的经过 USB 转串口芯片，标 USB 的直连芯片原生 USB |
| ESP32-C3 SuperMini / Seeed XIAO ESP32C3、ESP32S3 | 拇指大小的迷你板 |
| ESP32-CAM | 安信可 ESP32-S 模组（经典 ESP32）+ 摄像头 + PSRAM |
| Arduino Nano ESP32 | ESP32-S3 |

## 怎么选

| 需求 | 推荐 |
| --- | --- |
| 跟着教程入门、配合本站学习 | **经典 ESP32**（WROOM-32E 模组的 DevKit） |
| 经典蓝牙：蓝牙音箱、手机蓝牙串口 | 只能选 **经典 ESP32** |
| 摄像头、AI 识别、语音、彩屏界面、模拟 USB 键盘鼠标 | **ESP32-S3**，选 **N16R8**（16MB Flash + 8MB PSRAM） |
| 小体积、低成本，只要 WiFi / BLE 控制 | **ESP32-C3** |
| 智能家居 Matter / Zigbee / Thread、WiFi 6 | **ESP32-C6**（要 5GHz WiFi 选 C5） |

## 换型号时要注意

- **引脚不同**：下文的引脚坑只适用于经典款。S3 的启动引脚是 GPIO 0 / 3 / 45 / 46，带八线 PSRAM（R8）时 GPIO 35 ~ 37 被占用；C3 的启动引脚是 GPIO 2 / 8 / 9。**一定要看对应开发板的引脚图**。
- **FQBN 不同**：经典款 `esp32:esp32:esp32`，S3 `esp32:esp32:esp32s3`，C3 `esp32:esp32:esp32c3`，C6 `esp32:esp32:esp32c6`。选错了烧录会报 `This chip is ESP32-S3, not ESP32`。本站工作台目前只内置经典款 DevKit，其他型号可在 Arduino IDE 中选择对应开发板。
- **原生 USB 串口**：S3 / C3 / C6 通过芯片原生 USB 口打印日志时，需要在开发板选项中打开 **USB CDC On Boot**，否则 `Serial.print` 看不到输出。
- **外设差异**：DAC 只有经典款和 S2 有；经典蓝牙只有经典款有。

## 在本站开发

1. 在 [环境中心](/environment) 安装 **ESP32** 芯片核心（较大，耐心等待）。
2. 工作台选择开发板 **ESP32 DevKit**（FQBN `esp32:esp32:esp32`）。
3. 安装 USB 驱动：DevKit 常用 **CP2102** 或 **CH340**。
4. 编译 → 选择端口 → 烧录。

## 引脚注意事项

经典款 ESP32 的引脚有很多"坑"（S3 / C3 等其他型号规则不同，见上文）：

| 引脚 | 注意 |
| --- | --- |
| GPIO 0 | **启动模式引脚**，上电时为低则进入下载模式。接了按键/外设可能导致无法启动 |
| GPIO 2 | 启动时需为低或悬空，部分板子接了板载 LED |
| GPIO 12 | 启动时为高会导致 Flash 电压错误，尽量不用 |
| GPIO 6 ~ 11 | 连接内部 Flash，**禁止使用** |
| GPIO 34 ~ 39 | **仅输入**，没有内部上拉/下拉 |
| ADC2（GPIO 0, 2, 4, 12 ~ 15, 25 ~ 27） | WiFi 开启时 **不可用** |
| GPIO 1 / 3 | UART0，用于烧录和串口打印 |

**推荐的安全引脚**：GPIO 4、5、13、14、16 ~ 19、21 ~ 23、25 ~ 27、32、33。

## 从 Uno 迁移

| 差异 | 说明 |
| --- | --- |
| 电平 | 5V 模块需要电平转换或分压 |
| `int` | 4 字节 |
| ADC | 12 位，0 ~ 4095，非线性明显（可用 `analogReadMilliVolts`） |
| PWM | 任意引脚，`analogWrite` 或 `ledcAttach(pin, freq, bits)` |
| 串口 | 推荐 115200 |
| 看门狗 | `loop()` 中长时间死循环会触发看门狗复位，需适当 `delay(1)` 或 `yield()` |
| 多任务 | 底层是 **FreeRTOS**，可以用 `xTaskCreate` 创建真正的并行任务 |

## 烧录过程

ESP32 没有 AVR 那样的 Bootloader 机制，而是芯片内部 ROM 自带下载模式：

1. esptool 通过 USB 串口芯片的 DTR/RTS 信号控制 EN（复位）和 GPIO0。
2. 拉低 GPIO0 同时复位 → 进入下载模式。
3. 写入 Flash → 再次复位运行程序。

若自动下载失败，日志中一直显示 `Connecting....`，请 **按住 BOOT 键** 直到开始写入。

## 示例

```cpp
void setup() {
  Serial.begin(115200);
  pinMode(2, OUTPUT);
  Serial.printf("芯片型号: %s, 双核 %d MHz\n", ESP.getChipModel(), ESP.getCpuFreqMHz());
}

void loop() {
  digitalWrite(2, !digitalRead(2));
  delay(500);
}
```

下一步：[ESP32 物联网：WiFi、Web 与 MQTT](/library/platforms/esp32-iot)
