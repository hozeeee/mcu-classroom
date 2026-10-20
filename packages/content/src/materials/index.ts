import type { Material } from '@mcu/shared'
import { ACTUATOR_MATERIALS } from './actuators'
import { BASIC_MATERIALS } from './basic'
import { BOARD_MATERIALS } from './boards'
import { DISPLAY_MATERIALS } from './displays'
import { MODULE_MATERIALS } from './modules'
import { POWER_TOOL_MATERIALS } from './power-tools'
import { SENSOR_MATERIALS } from './sensors'

export const MATERIALS: Material[] = [
  ...BOARD_MATERIALS,
  ...BASIC_MATERIALS,
  ...SENSOR_MATERIALS,
  ...ACTUATOR_MATERIALS,
  ...DISPLAY_MATERIALS,
  ...MODULE_MATERIALS,
  ...POWER_TOOL_MATERIALS,
]
