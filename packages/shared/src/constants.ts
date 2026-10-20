/** 后端默认端口 */
export const DEFAULT_SERVER_PORT = 3211

export const API_PREFIX = '/api'

export const WS_PATHS = {
  tasks: '/ws/tasks',
  serial: '/ws/serial',
} as const

export const SERIAL_BAUD_RATES = [300, 1200, 2400, 4800, 9600, 19200, 38400, 57600, 74880, 115200, 230400, 460800, 921600] as const

export const DEFAULT_SKETCH = `void setup() {
  // 初始化代码：上电后只执行一次
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  // 主循环：反复执行
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
}
`
