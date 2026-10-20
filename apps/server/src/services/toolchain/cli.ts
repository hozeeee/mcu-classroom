import type { RunOptions, RunResult } from '../../utils/process'
import type { ToolchainPaths } from './paths'
import { existsSync } from 'node:fs'
import process from 'node:process'
import { runCommand } from '../../utils/process'
import { ensureCliConfig } from './paths'

export interface ResolvedCli {
  path: string
  source: 'managed' | 'system'
}

/** 在 PATH 中查找可执行文件 */
async function findInPath(command: string): Promise<string | undefined> {
  const finder = process.platform === 'win32' ? 'where' : 'which'
  try {
    const result = await runCommand(finder, [command])
    if (result.code === 0)
      return result.stdout.split(/\r?\n/)[0]?.trim() || undefined
  }
  catch {}
  return undefined
}

/**
 * arduino-cli 包装：
 * - 优先使用应用托管的二进制，其次使用系统 PATH 中的 arduino-cli
 * - 始终带上 --config-file，使数据目录独立
 */
export class ArduinoCli {
  constructor(private paths: ToolchainPaths) {}

  async resolve(): Promise<ResolvedCli | undefined> {
    if (existsSync(this.paths.cliBinary))
      return { path: this.paths.cliBinary, source: 'managed' }
    const system = await findInPath('arduino-cli')
    return system ? { path: system, source: 'system' } : undefined
  }

  async require(): Promise<ResolvedCli> {
    const cli = await this.resolve()
    if (!cli)
      throw new Error('尚未安装 arduino-cli，请先到「环境中心」一键安装')
    return cli
  }

  async run(args: string[], options: Omit<RunOptions, 'env'> = {}): Promise<RunResult> {
    const cli = await this.require()
    await ensureCliConfig(this.paths)
    return runCommand(cli.path, [...args, '--config-file', this.paths.configFile], {
      ...options,
      env: { ...process.env, ARDUINO_UPDATER_ENABLE_NOTIFICATION: 'false' },
    })
  }

  /** 执行命令，非 0 退出码时抛出包含 stderr 的错误 */
  async exec(args: string[], options: Omit<RunOptions, 'env'> = {}): Promise<RunResult> {
    const result = await this.run(args, options)
    if (result.code !== 0) {
      const detail = (result.stderr || result.stdout).trim().split(/\r?\n/).slice(-5).join('\n')
      throw new Error(`arduino-cli ${args[0]} ${args[1] ?? ''} 失败（退出码 ${result.code}）\n${detail}`)
    }
    return result
  }

  async json<T>(args: string[]): Promise<T> {
    const result = await this.exec([...args, '--format', 'json'])
    return JSON.parse(result.stdout || 'null') as T
  }

  async version(): Promise<string | undefined> {
    try {
      const data = await this.json<{ VersionString?: string, version_string?: string }>(['version'])
      return data?.VersionString ?? data?.version_string
    }
    catch {
      return undefined
    }
  }

  /** 启动长连接子进程（串口监视器）时使用 */
  async commandFor(args: string[]): Promise<{ command: string, args: string[] }> {
    const cli = await this.require()
    await ensureCliConfig(this.paths)
    return { command: cli.path, args: [...args, '--config-file', this.paths.configFile] }
  }
}
