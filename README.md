# MCU Classroom · 单片机一站式学习与实操平台

[![CI](https://github.com/hozeeee/mcu-classroom/actions/workflows/ci.yml/badge.svg)](https://github.com/hozeeee/mcu-classroom/actions/workflows/ci.yml)
[![Release](https://github.com/hozeeee/mcu-classroom/actions/workflows/release.yml/badge.svg)](https://github.com/hozeeee/mcu-classroom/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

这是一个面向**前端 / Node.js 开发者**的单片机入门平台。从“单片机是什么”讲起，一直到画电路、写代码、在线仿真、编译烧录、串口调试，所有环节都能在网站里完成。

支持 **Arduino（AVR）、ESP32、STM32、RP2040（树莓派 Pico）** 四类主流芯片。可以用浏览器访问，也可以直接装 Electron 桌面端。

---

## 功能一览

| 模块 | 说明 |
| --- | --- |
| 🧭 **学习路线** | 分 8 个阶段，从零基础到能独立做项目，每一步都关联文章、物料和实战项目，进度可以打勾记录 |
| 📚 **知识库** | 39 篇 Markdown 文章，涵盖入门、电学基础、元器件、编程、通信协议（UART / I²C / SPI…）、各芯片平台、调试与排障。文中示例代码可一键在工作台打开 |
| 🧩 **物料百科** | 介绍开发板、基础元件、传感器、执行器、显示屏、模块、电源与工具，包括用途、参数、引脚、采购建议和常见坑 |
| 🔌 **电路讲解与电路刻画** | 自研电路编辑器，可拖拽元件、连线、改属性、做电气检查（如短路、LED 缺限流电阻），支持导出 PNG / JSON |
| 💻 **程序编写** | 内置 CodeMirror 代码编辑器（C/C++ 高亮），代码与电路图保存在同一个项目里 |
| 🧪 **在线仿真** | 基于 avr8js 在浏览器中仿真 Arduino Uno：LED、按钮、蜂鸣器、电位器、串口输出都能实时联动，不用买硬件也能先跑起来 |
| ⚙️ **编译与烧录** | 后端调用 arduino-cli 在本机编译，再通过 USB 烧录到真实开发板，日志实时显示 |
| 📟 **串口调试** | 串口监视器支持 HEX / 时间戳 / 行尾选择 / 历史命令，自带串口绘图器（类似 Arduino Serial Plotter） |
| 🛠️ **环境中心** | 自动检测系统，一键安装工具链和各芯片的开发板支持包，按系统给出 USB 驱动指引，查看串口设备，管理第三方库 |
| 🚀 **实战项目** | 14 个循序渐进的项目，从闪烁 LED、呼吸灯、红绿灯到 DHT11、OLED、超声波、舵机、ESP32 网页控灯，每个项目都附接线图、代码和物料清单 |
| 🩺 **排障手册** | 25 个常见问题，覆盖驱动、烧录、编译、串口、电路、电源、仿真 7 类，按“现象 → 原因 → 解决办法”整理 |
| 🧮 **工具箱** | 欧姆定律、LED 限流电阻、色环电阻、电容读数、分压、进制转换计算器，以及开发板引脚图 |
| 📝 **笔记与进度** | 支持 Markdown 的学习笔记，记录学习进度；数据保存在本地 SQLite |

## 技术栈

- **Monorepo**：pnpm workspace，TypeScript 全栈
- **前端** `apps/web`：React 19、Vite、Ant Design 6、React Router 7、TanStack Query、Zustand、@xyflow/react（电路编辑器）、avr8js（仿真）、CodeMirror
- **后端** `apps/server`：Fastify 5、node:sqlite、@fastify/websocket（任务日志与串口数据流）、arduino-cli（编译 / 烧录 / 串口）
- **桌面端** `apps/desktop`：Electron。后端运行在主进程里，用 electron-builder 打包 Windows / macOS / Linux 安装包
- **共享包**：`packages/shared` 放类型、开发板定义和平台检测；`packages/content` 放学习路线、物料、项目、排障数据和 Markdown 文章
- **代码规范**：[@antfu/eslint-config](https://github.com/antfu/eslint-config)，同时负责格式化，不用 Prettier。提交时由 simple-git-hooks 和 lint-staged 自动执行 `eslint --fix`

## 目录结构

```text
mcu-classroom/
├── apps/
│   ├── web/                # React 前端
│   │   └── src/
│   │       ├── api/        # REST / WebSocket 客户端
│   │       ├── components/ # 通用组件（Markdown、任务日志、页面头部…）
│   │       ├── features/   # 业务模块：circuit / simulator / workbench / serial / toolbox
│   │       ├── layouts/    # 应用框架（侧边栏、顶栏、全局搜索）
│   │       ├── pages/      # 路由页面（按功能分目录）
│   │       ├── platform/   # 浏览器 / 桌面端平台检测
│   │       ├── queries/    # TanStack Query 数据钩子
│   │       └── stores/     # Zustand 全局状态
│   ├── server/             # Fastify 后端
│   │   └── src/
│   │       ├── db/         # SQLite 仓储（项目、进度、笔记）
│   │       ├── routes/     # REST 路由
│   │       ├── services/   # 工具链、编译烧录、串口、任务、文章
│   │       └── ws/         # WebSocket：任务日志、串口
│   └── desktop/            # Electron 桌面端
│       └── src/            # main / preload / platform / menu / window / server
├── packages/
│   ├── shared/             # 前后端共享类型、开发板、平台检测
│   └── content/            # 学习内容数据 + articles/ Markdown 文章
└── .github/                # CI、Release、Issue / PR 模板、Dependabot
```

## 快速开始

### 环境要求

- **Node.js ≥ 22.13**（后端使用内置的 `node:sqlite`），推荐 `nvm use` 读取 `.nvmrc`
- **pnpm 10**（`corepack enable` 后会自动使用 `packageManager` 字段指定的版本）

### 安装与开发

```bash
git clone https://github.com/hozeeee/mcu-classroom.git
cd mcu-classroom
pnpm install

# 同时启动后端（:3211）与前端（:5173）
pnpm dev
```

在浏览器中打开 <http://localhost:5173>。第一次使用时，建议先到 **环境中心**：

1. 点击「一键安装」安装 arduino-cli；
2. 安装要用的开发板支持包（例如 Arduino AVR）；
3. 如果板子插上后识别不到，按页面里的驱动指引安装 CH340 / CP210x 驱动。

完成后就能在 **工作台** 里编译、烧录了。

### 常用脚本

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` | 启动后端和前端开发服务器 |
| `pnpm dev:desktop` | 启动前端开发服务器 + Electron（前端改动可热更新） |
| `pnpm build` | 构建前端和后端 |
| `pnpm start` | 以生产模式启动后端，由后端托管前端页面（<http://127.0.0.1:3211>） |
| `pnpm build:desktop` | 构建前端、后端和 Electron 主进程 |
| `pnpm dist:desktop` | 打包当前系统的桌面端安装包，输出到 `apps/desktop/release` |
| `pnpm lint` / `pnpm lint:fix` | 代码检查 / 自动修复并格式化 |
| `pnpm typecheck` | 对所有包做 TypeScript 类型检查 |

### 环境变量

复制 `.env.example` 为 `.env` 后按需修改（也可以直接在命令行设置）：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `MCU_HOST` | `127.0.0.1` | 后端监听地址 |
| `MCU_PORT` | `3211` | 后端监听端口 |
| `MCU_DATA_DIR` | `~/.mcu-classroom` | 数据目录，存放 SQLite、工具链和临时工程 |
| `MCU_CONTENT_DIR` | - | 自定义文章目录 |
| `MCU_WEB_DIR` | - | 自定义前端静态资源目录 |
| `MCU_ARDUINO_CLI_MIRROR` | - | arduino-cli 下载镜像 |

> 网页版和桌面端默认使用同一个数据目录，所以工具链只要装一次，保存的项目两边都能看到。

## 桌面端

桌面端把后端直接放进 Electron 主进程运行，装好就能用，不需要另外安装 Node.js。

- **平台检测**：主进程（`process.platform`）、后端、前端（`navigator.userAgentData` / UA）都通过 `@mcu/shared` 的 `normalizeOs` / `normalizeArch` 判断系统，三处结果一致。页面通过 `window.mcuDesktop` 识别自己是否运行在桌面端。
- **按平台适配**：
  - macOS：标题栏内嵌红绿灯，顶栏可以拖动窗口；关闭窗口后应用仍留在 Dock，菜单按 macOS 习惯排列
  - Windows：设置 AppUserModelId，安装方式为 NSIS（可选择安装目录）
  - Linux：提供 AppImage 和 deb；后端会检测串口权限，提示把用户加入 `dialout` 组
- **安全**：开启 `contextIsolation` 和 `sandbox`，preload 只暴露最少的接口；外部链接一律交给系统浏览器打开，页面不能跳转到其它站点。
- **单实例**：同一时间只能运行一个实例，避免工具链安装或串口被两个进程同时占用。

推送 `v*` 标签后，GitHub Actions 会在三个系统上分别打包，并把安装包上传到 Release 草稿：

```bash
git tag v0.1.0
git push origin v0.1.0
```

## 学习建议（给前端开发者）

1. 先看 **学习路线** 前两个阶段，搞懂电压、电流、电阻和 GPIO 是什么；
2. 在 **工作台** 里用仿真跑通“闪烁 LED”，体会 `setup()` / `loop()` 的写法和 Node 事件循环有什么不同；
3. 买一块 Arduino Uno（或兼容板）和入门套件（**物料百科** 里有清单），把同一段程序烧录到真板子上；
4. 按顺序完成 **实战项目**，遇到问题先查 **排障手册**；
5. 有了基础之后，再学 ESP32（Wi-Fi / 蓝牙）、STM32（工业常用）、RP2040（双核、PIO）。

## 贡献

欢迎提交 Issue 和 PR。提交前请确认 `pnpm lint` 和 `pnpm typecheck` 都能通过。文章放在 `packages/content/articles/<分类>/` 下，使用带 frontmatter 的 Markdown。

## 许可证

[MIT](./LICENSE) © hozeeee
