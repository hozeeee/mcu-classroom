import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { getCoreIndexUrls } from '@mcu/shared'

export interface ToolchainPaths {
  root: string
  binDir: string
  cliBinary: string
  configFile: string
  dataDir: string
  downloadsDir: string
  userDir: string
  /** 编译工作区：每块开发板一个固定 sketch 目录，便于增量编译 */
  workspaceDir: string
}

export function resolveToolchainPaths(appDataDir: string): ToolchainPaths {
  const root = path.join(appDataDir, 'toolchain')
  const binDir = path.join(root, 'bin')
  const exe = process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli'
  return {
    root,
    binDir,
    cliBinary: path.join(binDir, exe),
    configFile: path.join(root, 'arduino-cli.yaml'),
    dataDir: path.join(root, 'data'),
    downloadsDir: path.join(root, 'downloads'),
    userDir: path.join(root, 'user'),
    workspaceDir: path.join(appDataDir, 'workspace'),
  }
}

/** YAML 单引号字符串：反斜杠不转义，单引号需写两次（兼容 Windows 路径） */
function yamlString(value: string): string {
  return `'${value.replaceAll('\'', '\'\'')}'`
}

/** 生成 arduino-cli 配置：所有数据都放在应用数据目录内，不污染用户的全局环境 */
export async function writeCliConfig(paths: ToolchainPaths): Promise<void> {
  await mkdir(paths.root, { recursive: true })
  const urls = getCoreIndexUrls().map(url => `    - ${yamlString(url)}`).join('\n')
  const yaml = [
    'directories:',
    `  data: ${yamlString(paths.dataDir)}`,
    `  downloads: ${yamlString(paths.downloadsDir)}`,
    `  user: ${yamlString(paths.userDir)}`,
    'board_manager:',
    '  additional_urls:',
    urls,
    'locale: en',
    'library:',
    '  enable_unsafe_install: false',
    '',
  ].join('\n')
  await writeFile(paths.configFile, yaml, 'utf8')
}

export async function ensureCliConfig(paths: ToolchainPaths): Promise<void> {
  if (!existsSync(paths.configFile))
    await writeCliConfig(paths)
}
