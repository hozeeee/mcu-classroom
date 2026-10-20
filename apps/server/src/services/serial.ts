import type { Buffer } from 'node:buffer'
import type { ChildProcessWithoutNullStreams } from 'node:child_process'
import type { ArduinoCli } from './toolchain/cli'
import { spawn } from 'node:child_process'
import { errorMessage } from '../utils/errors'

export interface SerialListener {
  /** 串口收到的原始字节 */
  onData: (chunk: Buffer) => void
  onStatus: (open: boolean, message: string) => void
}

interface Session {
  port: string
  baud: number
  child: ChildProcessWithoutNullStreams
  listeners: Set<SerialListener>
  /** 主动关闭（如烧录前）时不再提示异常退出 */
  closing: boolean
}

/**
 * 串口会话管理：基于 `arduino-cli monitor` 子进程实现，无需原生模块。
 * 同一端口只保持一个子进程，多个前端连接共享数据。
 */
export class SerialManager {
  private sessions = new Map<string, Session>()

  constructor(private cli: ArduinoCli) {}

  async attach(port: string, baud: number, listener: SerialListener): Promise<{ send: (data: string) => void, detach: () => void }> {
    let session = this.sessions.get(port)
    if (session && session.baud !== baud) {
      this.close(port, `波特率切换为 ${baud}，正在重新连接`)
      session = undefined
    }
    session ??= await this.open(port, baud)
    session.listeners.add(listener)
    listener.onStatus(true, `已连接 ${port} @ ${baud}`)

    const current = session
    return {
      send: (data: string) => {
        if (!current.child.stdin.destroyed)
          current.child.stdin.write(data)
      },
      detach: () => {
        current.listeners.delete(listener)
        if (current.listeners.size === 0)
          this.close(port)
      },
    }
  }

  /** 关闭端口（烧录前调用，释放串口占用） */
  close(port: string, reason = '串口已关闭'): boolean {
    const session = this.sessions.get(port)
    if (!session)
      return false
    session.closing = true
    this.sessions.delete(port)
    session.listeners.forEach(listener => listener.onStatus(false, reason))
    session.child.kill()
    return true
  }

  closeAll(): void {
    for (const port of [...this.sessions.keys()])
      this.close(port, '服务已停止')
  }

  isOpen(port: string): boolean {
    return this.sessions.has(port)
  }

  private async open(port: string, baud: number): Promise<Session> {
    const { command, args } = await this.cli.commandFor(['monitor', '-p', port, '-c', `baudrate=${baud}`, '-q'])
    const child = spawn(command, args, { windowsHide: true })
    const session: Session = { port, baud, child, listeners: new Set(), closing: false }
    this.sessions.set(port, session)

    child.stdout.on('data', (chunk: Buffer) => {
      session.listeners.forEach(listener => listener.onData(chunk))
    })
    let stderr = ''
    child.stderr.setEncoding('utf8')
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk
    })
    child.on('error', (error) => {
      this.fail(session, `无法启动串口监视器：${errorMessage(error)}`)
    })
    child.on('close', (code) => {
      this.fail(session, stderr.trim() || `串口监视器已退出（${code}）`)
    })
    return session
  }

  private fail(session: Session, message: string): void {
    if (session.closing)
      return
    session.closing = true
    if (this.sessions.get(session.port) === session)
      this.sessions.delete(session.port)
    session.listeners.forEach(listener => listener.onStatus(false, message))
  }
}
