/** 单个引脚的电平监视器：统计一个采样窗口内的占空比、频率和脉宽 */
export class PinMonitor {
  private level = false
  private lastChange = 0
  private highCycles = 0
  private windowStart = 0
  private riseAt = 0
  private pulseCycles = 0
  private rises: number[] = []

  constructor(private readonly clockHz: number) {}

  update(level: boolean, cycles: number): void {
    if (level === this.level)
      return
    if (this.level) {
      this.highCycles += cycles - Math.max(this.lastChange, this.windowStart)
      this.pulseCycles = cycles - this.riseAt
    }
    else {
      this.riseAt = cycles
      this.rises.push(cycles)
    }
    this.level = level
    this.lastChange = cycles
  }

  beginWindow(cycles: number): void {
    this.windowStart = cycles
    this.highCycles = 0
    // 频率按最近 100ms 内的上升沿计算，避免单帧样本太少
    const keepFrom = cycles - this.clockHz / 10
    this.rises = this.rises.filter(at => at >= keepFrom)
  }

  stats(cycles: number) {
    const span = cycles - this.windowStart
    const high = this.highCycles + (this.level ? cycles - Math.max(this.lastChange, this.windowStart) : 0)
    const rises = this.rises
    const frequency = rises.length >= 3
      ? ((rises.length - 1) * this.clockHz) / (rises[rises.length - 1]! - rises[0]!)
      : 0
    return {
      level: this.level,
      duty: span > 0 ? high / span : (this.level ? 1 : 0),
      frequency,
      pulseUs: (this.pulseCycles / this.clockHz) * 1e6,
    }
  }
}

export type PinStats = ReturnType<PinMonitor['stats']>
