import type { LibraryInfo, SerialPortInfo, ToolchainStatus } from '@mcu/shared'
import type { TaskContext } from '../tasks'
import type { ToolchainPaths } from './paths'
import { BOARD_CORES, getCore } from '@mcu/shared'
import { badRequest } from '../../utils/errors'
import { ArduinoCli } from './cli'
import { downloadCli, getCliDownloadUrl } from './download'
import { parseBoardList, parseCoreList, parseLibraryList, parseLibrarySearch } from './parsers'
import { resolveToolchainPaths, writeCliConfig } from './paths'

/** 工具链服务：arduino-cli 安装、开发板核心、库管理、端口探测 */
export class ToolchainService {
  readonly paths: ToolchainPaths
  readonly cli: ArduinoCli

  constructor(appDataDir: string) {
    this.paths = resolveToolchainPaths(appDataDir)
    this.cli = new ArduinoCli(this.paths)
  }

  async status(): Promise<ToolchainStatus> {
    const resolved = await this.cli.resolve()
    const base = {
      toolchainDir: this.paths.root,
      downloadUrl: getCliDownloadUrl(),
    }
    if (!resolved) {
      return {
        ...base,
        cli: { installed: false },
        cores: BOARD_CORES.map(core => ({ id: core.id, name: core.name, installed: false })),
      }
    }

    const [version, installed] = await Promise.all([
      this.cli.version(),
      this.cli.json<unknown>(['core', 'list']).then(parseCoreList).catch(() => []),
    ])
    return {
      ...base,
      cli: { installed: true, version, path: resolved.path, source: resolved.source },
      cores: BOARD_CORES.map((core) => {
        const found = installed.find(item => item.id === core.id)
        return {
          id: core.id,
          name: core.name,
          installed: Boolean(found?.installedVersion),
          installedVersion: found?.installedVersion,
          latestVersion: found?.latestVersion,
        }
      }),
    }
  }

  async installCli(ctx: TaskContext): Promise<void> {
    await downloadCli(this.paths, ctx)
    await writeCliConfig(this.paths)
    ctx.log('正在初始化开发板索引（首次可能需要几十秒）…')
    await this.cli.exec(['core', 'update-index'], { onLine: line => ctx.log(line, 'stdout') })
    ctx.log('✔ arduino-cli 安装完成')
  }

  async installCore(coreId: string, ctx: TaskContext): Promise<void> {
    const core = getCore(coreId)
    if (!core)
      throw badRequest(`未知的开发板核心：${coreId}`)
    // 重新写入配置，确保第三方索引地址是最新的
    await writeCliConfig(this.paths)
    ctx.log('更新开发板索引…')
    await this.cli.exec(['core', 'update-index'], { onLine: line => ctx.log(line, 'stdout') })
    ctx.log(`安装 ${core.name}（${core.sizeHint}），请耐心等待…`)
    await this.cli.exec(['core', 'install', core.id], { onLine: (line, stream) => ctx.log(line, stream) })
    ctx.log(`✔ ${core.name} 安装完成`)
  }

  async searchLibraries(keyword: string): Promise<LibraryInfo[]> {
    const data = await this.cli.json<unknown>(['lib', 'search', keyword, '--omit-releases-details'])
    return parseLibrarySearch(data).slice(0, 50)
  }

  async listLibraries(): Promise<LibraryInfo[]> {
    return parseLibraryList(await this.cli.json<unknown>(['lib', 'list']))
  }

  async installLibrary(name: string, ctx: TaskContext): Promise<void> {
    ctx.log('更新库索引…')
    await this.cli.exec(['lib', 'update-index'], { onLine: line => ctx.log(line, 'stdout') })
    await this.cli.exec(['lib', 'install', name], { onLine: (line, stream) => ctx.log(line, stream) })
    ctx.log(`✔ 库 ${name} 安装完成`)
  }

  async listPorts(): Promise<SerialPortInfo[]> {
    return parseBoardList(await this.cli.json<unknown>(['board', 'list']))
  }
}
