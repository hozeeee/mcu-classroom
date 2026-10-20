/** 用 WebAudio 方波模拟无源蜂鸣器的声音 */
export class BuzzerAudio {
  private context?: AudioContext
  private oscillator?: OscillatorNode
  private gain?: GainNode

  setFrequency(frequency: number): void {
    if (frequency <= 0) {
      this.gain?.gain.setTargetAtTime(0, this.context!.currentTime, 0.01)
      return
    }
    if (!this.context) {
      this.context = new AudioContext()
      this.gain = this.context.createGain()
      this.gain.gain.value = 0
      this.gain.connect(this.context.destination)
      this.oscillator = this.context.createOscillator()
      this.oscillator.type = 'square'
      this.oscillator.connect(this.gain)
      this.oscillator.start()
    }
    this.oscillator!.frequency.setTargetAtTime(frequency, this.context.currentTime, 0.005)
    this.gain!.gain.setTargetAtTime(0.04, this.context.currentTime, 0.005)
  }

  dispose(): void {
    this.oscillator?.stop()
    void this.context?.close()
    this.context = undefined
    this.oscillator = undefined
    this.gain = undefined
  }
}
