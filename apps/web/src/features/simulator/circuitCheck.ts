import type { CircuitDoc, CircuitPart } from '@mcu/shared'
import type { Drive, Netlist } from './netlist'
import { getPartDefinition } from '../circuit/parts/registry'
import { buildNetlist, resolveDrive } from './netlist'

export interface CircuitIssue {
  level: 'error' | 'warning' | 'info'
  message: string
  partId?: string
}

function partLabel(part: CircuitPart): string {
  return `${getPartDefinition(part.type)?.name ?? part.type}（${part.id}）`
}

function driveResistors(drive: Drive): number {
  return drive.kind === 'none' ? 0 : drive.resistors
}

function checkLed(netlist: Netlist, part: CircuitPart, issues: CircuitIssue[]): void {
  const anode = resolveDrive(netlist, netlist.netOf(part.id, 'A'))
  const cathode = resolveDrive(netlist, netlist.netOf(part.id, 'C'))
  const label = partLabel(part)
  if (anode.kind === 'none' || cathode.kind === 'none') {
    issues.push({ level: 'info', message: `${label} 有引脚未连接，无法形成回路`, partId: part.id })
    return
  }
  if (anode.kind === 'ground' && cathode.kind !== 'ground')
    issues.push({ level: 'warning', message: `${label} 可能接反了：长脚 A 应接高电位，短脚 K 接 GND`, partId: part.id })
  if (driveResistors(anode) + driveResistors(cathode) === 0)
    issues.push({ level: 'warning', message: `${label} 没有串联限流电阻，真实电路中可能烧毁 LED 或损坏引脚`, partId: part.id })
}

function checkPotentiometer(netlist: Netlist, part: CircuitPart, issues: CircuitIssue[]): void {
  const vcc = netlist.netOf(part.id, 'VCC')
  const gnd = netlist.netOf(part.id, 'GND')
  if (vcc.powerVolts === undefined && !vcc.ground)
    issues.push({ level: 'warning', message: `${partLabel(part)} 的 VCC 脚未接电源`, partId: part.id })
  if (!gnd.ground && gnd.powerVolts === undefined)
    issues.push({ level: 'warning', message: `${partLabel(part)} 的 GND 脚未接地`, partId: part.id })
}

/** 静态电路检查：短路、LED 限流、接反、未接线等常见新手错误 */
export function checkCircuit(doc: CircuitDoc, netlist: Netlist = buildNetlist(doc)): CircuitIssue[] {
  const issues: CircuitIssue[] = []
  if (!netlist.board)
    issues.push({ level: 'info', message: '电路中还没有开发板，从元件库中添加一块吧' })

  for (const net of netlist.nets) {
    if (net.ground && net.powerVolts !== undefined)
      issues.push({ level: 'error', message: `电源（${net.powerVolts}V）与 GND 直接相连 —— 短路！真实电路会发热甚至损坏开发板` })
    if (net.ioPins.length && (net.ground || net.powerVolts !== undefined))
      issues.push({ level: 'warning', message: `${net.ioPins.join('、')} 直接接到了${net.ground ? ' GND' : '电源'}，如果设为输出相反电平会短路，建议串联电阻` })
    if (net.ioPins.length > 1)
      issues.push({ level: 'info', message: `${net.ioPins.join('、')} 被连在了同一根线上` })
  }

  const wired = new Set(doc.wires.flatMap(wire => [wire.from.part, wire.to.part]))
  for (const part of doc.parts) {
    if (!wired.has(part.id) && !part.type.startsWith('board:'))
      issues.push({ level: 'info', message: `${partLabel(part)} 尚未接线`, partId: part.id })
    else if (part.type === 'led')
      checkLed(netlist, part, issues)
    else if (part.type === 'potentiometer')
      checkPotentiometer(netlist, part, issues)
  }
  return issues
}
