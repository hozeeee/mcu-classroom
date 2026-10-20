import type { ExampleProject, ExampleProjectSummary } from '@mcu/shared'
import { blink } from './blink'
import { breathingLed } from './breathing-led'
import { buttonLed } from './button-led'
import { buzzerMelody } from './buzzer-melody'
import { dht11 } from './dht11'
import { esp32WebLed } from './esp32-web-led'
import { lightSensor } from './light-sensor'
import { oled } from './oled'
import { picoBlink } from './pico-blink'
import { potentiometer } from './potentiometer'
import { servo } from './servo'
import { stm32Blink } from './stm32-blink'
import { trafficLight } from './traffic-light'
import { ultrasonic } from './ultrasonic'

export const EXAMPLE_PROJECTS: ExampleProject[] = [
  blink,
  trafficLight,
  buttonLed,
  breathingLed,
  potentiometer,
  buzzerMelody,
  lightSensor,
  dht11,
  ultrasonic,
  servo,
  oled,
  esp32WebLed,
  stm32Blink,
  picoBlink,
]

export function toProjectSummary(project: ExampleProject): ExampleProjectSummary {
  const { code: _code, circuit: _circuit, guide: _guide, wiring: _wiring, ...summary } = project
  return summary
}
