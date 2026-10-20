---
title: ESP32 物联网：WiFi、Web 与 MQTT
summary: 让 ESP32 连接 WiFi、运行网页服务器、调用 HTTP 接口、通过 MQTT 与云端通信——前端开发者最熟悉的部分。
difficulty: intermediate
minutes: 25
tags: [ESP32, WiFi, HTTP, WebServer, MQTT, 物联网]
order: 3
---

## 连接 WiFi

```cpp
#include <WiFi.h>

const char* SSID = "你的WiFi名";
const char* PASSWORD = "你的WiFi密码";

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.print("\n已连接，IP: ");
  Serial.println(WiFi.localIP());
}
```

> ESP32 只支持 **2.4GHz** WiFi，不支持 5GHz。

## 在 ESP32 上运行网页服务器

ESP32 可以像 Express 一样处理 HTTP 请求：

```cpp
#include <WebServer.h>
WebServer server(80);

void setup() {
  // ...连接 WiFi...
  server.on("/", []() {
    server.send(200, "text/html", "<h1>Hello from ESP32</h1>");
  });
  server.on("/api/led", HTTP_POST, []() {
    bool on = server.arg("on") == "1";
    digitalWrite(2, on);
    server.send(200, "application/json", on ? "{\"led\":true}" : "{\"led\":false}");
  });
  server.begin();
}

void loop() {
  server.handleClient();
}
```

完整示例见 [网页控制 LED 项目](/projects/esp32-web-led)。

更进一步：

- **ESPAsyncWebServer** 库：异步处理，支持 WebSocket。
- **LittleFS**：把 HTML/JS/CSS 文件存到 ESP32 的 Flash 里，你甚至可以把一个打包好的 React 小应用放进去。

## 调用 HTTP 接口

```cpp
#include <HTTPClient.h>

HTTPClient http;
http.begin("http://api.example.com/data");
int code = http.GET();
if (code == 200) {
  String body = http.getString();
  Serial.println(body);
}
http.end();
```

解析 JSON 使用 **ArduinoJson** 库：

```cpp
#include <ArduinoJson.h>
JsonDocument doc;
deserializeJson(doc, body);
float temp = doc["main"]["temp"];
```

## MQTT

MQTT 是物联网最常用的 **发布/订阅** 协议，类似前端的事件总线：

```
ESP32 ──publish("home/temp", "23.5")──► MQTT Broker ──► 手机 App / 网页 / Node.js 服务
ESP32 ◄──subscribe("home/led")──────────            ◄── publish("home/led", "on")
```

- Broker：可自建 **Mosquitto** / **EMQX**，或使用公共测试服务器 `broker.emqx.io`。
- ESP32 端库：**PubSubClient**。
- Node.js 端库：**mqtt**（npm），浏览器也可通过 MQTT over WebSocket 直连。

```cpp
#include <PubSubClient.h>
WiFiClient wifiClient;
PubSubClient mqtt(wifiClient);

void onMessage(char* topic, byte* payload, unsigned int len) {
  String msg((char*)payload, len);
  if (msg == "on") digitalWrite(2, HIGH);
}

void setup() {
  // ...连接 WiFi...
  mqtt.setServer("broker.emqx.io", 1883);
  mqtt.setCallback(onMessage);
}

void loop() {
  if (!mqtt.connected()) {
    mqtt.connect("esp32-demo-client");
    mqtt.subscribe("mcu-classroom/led");
  }
  mqtt.loop();
}
```

## 其他无线能力

| 功能 | 说明 |
| --- | --- |
| AP 模式 | ESP32 自己当热点，手机直连配置 |
| BLE | 低功耗蓝牙，与手机小程序/Web Bluetooth 通信 |
| ESP-NOW | 乐鑫私有协议，多块 ESP32 之间无需路由器直接通信 |
| OTA | 通过 WiFi 无线升级固件 |

## 安全提示

- 不要把 WiFi 密码提交到 GitHub，可以放到单独的 `secrets.h` 并加入 `.gitignore`。
- 使用公共 MQTT 服务器时任何人都能订阅你的主题，正式项目请使用带认证的 Broker。
