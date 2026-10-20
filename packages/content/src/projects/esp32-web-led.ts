import type { ExampleProject } from '@mcu/shared'
import { circuit, ledWithResistor, part } from './helpers'

const led = ledWithResistor({ board: 'esp', signalPin: 'GPIO4', groundPin: 'GND2', index: 1, x: 320, y: 230, ohms: 330 })

export const esp32WebLed: ExampleProject = {
  id: 'esp32-web-led',
  title: 'ESP32 网页控制 LED',
  summary: 'ESP32 连接 WiFi 后启动 Web 服务器，用手机浏览器即可开关灯。',
  difficulty: 'intermediate',
  boardId: 'esp32-devkit',
  tags: ['ESP32', 'WiFi', 'HTTP', '物联网', '需真实硬件'],
  articles: ['esp32-intro', 'esp32-iot'],
  materials: [
    { materialId: 'esp32-devkit', quantity: 1 },
    { materialId: 'led', quantity: 1 },
    { materialId: 'resistor', quantity: 1, note: '330Ω' },
    { materialId: 'breadboard', quantity: 1 },
    { materialId: 'jumper-wires', quantity: 3 },
  ],
  wiring: [
    { from: 'ESP32 GPIO4 (D4)', to: '330Ω → LED 阳极' },
    { from: 'LED 阴极', to: 'GND' },
  ],
  guide: `## 准备

1. 在 **环境中心** 安装 **ESP32** 芯片核心（体积较大，耐心等待）。
2. 修改代码中的 WIFI_SSID 与 WIFI_PASSWORD（ESP32 只支持 **2.4GHz** WiFi）。
3. 烧录后打开串口监视器（波特率 **115200**），记下打印出的 IP 地址。
4. 手机与电脑连同一个 WiFi，浏览器访问该 IP。

## 原理

- WiFi.begin() 以 **STA 模式** 接入路由器。
- WebServer 监听 80 端口，server.on("/on", ...) 注册路由——是不是和 Express 很像？
- 浏览器请求 /on 时，处理函数把 GPIO4 置高。

## 排错

- 一直打印 "."：WiFi 名称密码错误或是 5GHz 网络。
- 烧录卡在 Connecting...：按住板子上的 **BOOT** 键。

## 扩展练习

- 用 fetch + JSON 做一个无刷新的控制页面。
- 接入 MQTT，在任何地方远程控制（见《ESP32 物联网》）。
`,
  code: String.raw`// ESP32 网页控制 LED
#include <WiFi.h>
#include <WebServer.h>

const char* WIFI_SSID = "你的WiFi名称";
const char* WIFI_PASSWORD = "你的WiFi密码";
const int LED_PIN = 4;

WebServer server(80);
bool ledOn = false;

String page() {
  String html = "<!DOCTYPE html><html><head><meta charset='utf-8'>";
  html += "<meta name='viewport' content='width=device-width,initial-scale=1'>";
  html += "<title>ESP32 LED</title></head><body style='font-family:sans-serif;text-align:center'>";
  html += "<h1>ESP32 LED 控制</h1>";
  html += "<p>当前状态：<b>" + String(ledOn ? "开" : "关") + "</b></p>";
  html += "<p><a href='/on'><button style='font-size:24px'>开灯</button></a> ";
  html += "<a href='/off'><button style='font-size:24px'>关灯</button></a></p>";
  html += "</body></html>";
  return html;
}

void handleRoot() { server.send(200, "text/html", page()); }

void handleOn() {
  ledOn = true;
  digitalWrite(LED_PIN, HIGH);
  server.sendHeader("Location", "/");
  server.send(302);
}

void handleOff() {
  ledOn = false;
  digitalWrite(LED_PIN, LOW);
  server.sendHeader("Location", "/");
  server.send(302);
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("已连接，IP 地址: ");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.on("/on", handleOn);
  server.on("/off", handleOff);
  server.begin();
}

void loop() {
  server.handleClient();
}
`,
  circuit: circuit([part('esp', 'board:esp32-devkit', 0, 0), ...led.parts], led.wires),
}
