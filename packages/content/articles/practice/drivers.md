---
title: USB 转串口驱动安装
summary: CH340、CP2102、FT232、ST-Link 驱动在 Windows / macOS / Linux 上的安装方法，以及如何确认端口。
difficulty: beginner
minutes: 10
tags: [驱动, CH340, CP2102, ST-Link, 串口, 端口]
order: 4
---

## 为什么需要驱动

大多数开发板上的单片机本身没有 USB 功能，而是通过一颗 **USB 转串口芯片** 与电脑通信。电脑需要对应的驱动才能识别这颗芯片，生成一个 **串口设备**：

| 系统 | 端口名示例 |
| --- | --- |
| Windows | `COM3`、`COM4` |
| macOS | `/dev/cu.usbserial-1410`、`/dev/cu.wchusbserial1410`、`/dev/cu.usbmodem14101` |
| Linux | `/dev/ttyUSB0`（CH340/CP2102）、`/dev/ttyACM0`（原生 USB） |

## 识别你的芯片

看开发板 USB 接口旁边最大的那颗芯片上的丝印：

| 芯片 | 常见于 | 驱动来源 |
| --- | --- | --- |
| **CH340 / CH341 / CH9102** | 国产 Uno/Nano 兼容板、ESP32 | 沁恒 WCH 官网 |
| **CP2102 / CP2104** | ESP32 DevKit、NodeMCU | Silicon Labs 官网 |
| **FT232RL** | 部分 Nano、USB-TTL 模块 | FTDI 官网 |
| ATmega16U2 | 原版 Arduino Uno | 系统自带 |
| 原生 USB（RP2040、ESP32-S3、ATmega32U4） | Pico、Leonardo | 系统自带（CDC） |

## 本站的驱动指引

打开 [环境中心](/environment)，页面会根据 **检测到的操作系统** 自动显示对应驱动的安装步骤与下载链接。

## Windows

1. 插上开发板，打开 **设备管理器**（Win + X → 设备管理器）。
2. 查看 **端口 (COM 和 LPT)**：
   - 有 `USB-SERIAL CH340 (COM3)` 之类 → 驱动正常。
   - 在"其他设备"中出现带黄色感叹号的 `USB2.0-Serial` → 需要装驱动。
3. 下载 CH340 驱动 `CH341SER.EXE` 或 CP210x 驱动，运行安装后重新插拔。

## macOS

- macOS 10.14+ 已内置 CH34x、CP210x 的基础驱动，通常 **插上即用**。
- 如需安装官方驱动，安装后在 **系统设置 → 隐私与安全性** 中点击"允许"加载扩展，然后重启。
- 端口请选择 `/dev/cu.*`，而不是 `/dev/tty.*`。
- 在终端中查看：`ls /dev/cu.*`

## Linux

- 内核自带 `ch341`、`cp210x`、`ftdi_sio`、`cdc_acm` 驱动，无需安装。
- 需要 **串口访问权限**：

```bash
sudo usermod -aG dialout $USER    # Debian / Ubuntu
sudo usermod -aG uucp $USER       # Arch
# 注销重新登录后生效
```

- Ubuntu 22.04+ 的 `brltty`（盲文显示器服务）可能会抢占 CH340，导致端口一闪即逝：

```bash
sudo apt remove brltty
```

- 查看设备：`ls /dev/ttyUSB* /dev/ttyACM*`，或 `dmesg | tail` 查看插入日志。

本站在 Linux 上会自动检测当前用户是否在 dialout 组中，并在环境中心给出提示。

## ST-Link（STM32）

- Windows：安装 **STM32CubeProgrammer** 时会附带 ST-Link 驱动。
- macOS / Linux：免驱；Linux 需要 udev 规则（STM32CubeProgrammer 安装包中附带）。

## 确认端口

在本站工作台或串口监视器中点击 **刷新端口**，插拔开发板，新出现的那个就是它。
