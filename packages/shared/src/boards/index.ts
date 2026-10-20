import type { BoardDefinition } from '../types/board'
import { arduinoNano, arduinoUno } from './avr'
import { esp32DevKit } from './esp32'
import { rpiPico } from './rp2040'
import { stm32BluePill } from './stm32'

export const BOARDS: BoardDefinition[] = [arduinoUno, arduinoNano, esp32DevKit, stm32BluePill, rpiPico]

export const DEFAULT_BOARD_ID = arduinoUno.id

export function getBoard(id: string): BoardDefinition | undefined {
  return BOARDS.find(board => board.id === id)
}

export const BOARD_FAMILY_LABELS: Record<BoardDefinition['family'], string> = {
  avr: 'Arduino (AVR)',
  esp32: 'ESP32',
  stm32: 'STM32',
  rp2040: 'RP2040 (Pico)',
}
