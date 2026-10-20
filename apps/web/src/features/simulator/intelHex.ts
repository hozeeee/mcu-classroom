/**
 * 解析 Intel HEX 固件（arduino-cli 编译 AVR 的输出格式）到 Flash 字节数组
 * 每行格式：:LLAAAATT[DD...]CC  —— 长度 / 地址 / 类型 / 数据 / 校验
 */
export function loadIntelHex(source: string, target: Uint8Array): void {
  let base = 0
  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line.startsWith(':'))
      continue
    const bytes = line.slice(1).match(/../g)?.map(byte => Number.parseInt(byte, 16)) ?? []
    const [count = 0, high = 0, low = 0, type = 0] = bytes
    const address = (high << 8) | low
    const data = bytes.slice(4, 4 + count)
    if (type === 0x00)
      target.set(data, base + address)
    else if (type === 0x01)
      break
    else if (type === 0x02)
      base = (((data[0] ?? 0) << 8) | (data[1] ?? 0)) << 4
    else if (type === 0x04)
      base = (((data[0] ?? 0) << 8) | (data[1] ?? 0)) << 16
  }
}
