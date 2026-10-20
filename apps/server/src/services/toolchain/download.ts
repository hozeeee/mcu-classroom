import type { Buffer } from 'node:buffer'
import type { ReadableStream as WebReadableStream } from 'node:stream/web'
import type { TaskContext } from '../tasks'
import type { ToolchainPaths } from './paths'
import { createWriteStream, existsSync } from 'node:fs'
import { chmod, mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import extractZip from 'extract-zip'
import { x as extractTar } from 'tar'

const DEFAULT_MIRROR = 'https://downloads.arduino.cc'

/** 根据当前系统与 CPU 架构选择 arduino-cli 发行包 */
export function resolveCliAsset(platform: NodeJS.Platform = process.platform, arch: string = process.arch): { name: string, archive: 'zip' | 'tar.gz' } {
  switch (platform) {
    case 'win32':
      return { name: arch === 'ia32' ? 'Windows_32bit' : 'Windows_64bit', archive: 'zip' }
    case 'darwin':
      return { name: arch === 'arm64' ? 'macOS_ARM64' : 'macOS_64bit', archive: 'tar.gz' }
    default:
      if (arch === 'arm64')
        return { name: 'Linux_ARM64', archive: 'tar.gz' }
      if (arch === 'arm')
        return { name: 'Linux_ARMv7', archive: 'tar.gz' }
      return { name: arch === 'ia32' ? 'Linux_32bit' : 'Linux_64bit', archive: 'tar.gz' }
  }
}

export function getCliDownloadUrl(): string {
  const mirror = (process.env.MCU_ARDUINO_CLI_MIRROR || DEFAULT_MIRROR).replace(/\/+$/, '')
  const asset = resolveCliAsset()
  return `${mirror}/arduino-cli/arduino-cli_latest_${asset.name}.${asset.archive}`
}

async function download(url: string, file: string, ctx: TaskContext): Promise<void> {
  const response = await fetch(url, { redirect: 'follow' })
  if (!response.ok || !response.body)
    throw new Error(`下载失败：HTTP ${response.status}`)

  const total = Number(response.headers.get('content-length') ?? 0)
  let received = 0
  let lastPercent = 0
  const body = Readable.fromWeb(response.body as WebReadableStream)
  body.on('data', (chunk: Buffer) => {
    received += chunk.length
    if (!total)
      return
    const percent = Math.floor((received / total) * 100)
    if (percent - lastPercent >= 10) {
      lastPercent = percent
      ctx.log(`下载进度 ${percent}%（${(received / 1024 / 1024).toFixed(1)} MB）`)
    }
  })
  await pipeline(body, createWriteStream(file))
}

/** 下载并解压 arduino-cli 到 toolchain/bin */
export async function downloadCli(paths: ToolchainPaths, ctx: TaskContext): Promise<void> {
  const url = getCliDownloadUrl()
  const asset = resolveCliAsset()
  await mkdir(paths.binDir, { recursive: true })
  const archive = path.join(paths.root, `arduino-cli.${asset.archive}`)

  ctx.log(`开始下载 ${url}`)
  await download(url, archive, ctx)
  ctx.log('下载完成，正在解压…')

  if (asset.archive === 'zip')
    await extractZip(archive, { dir: path.resolve(paths.binDir) })
  else
    await extractTar({ file: archive, cwd: paths.binDir })

  await rm(archive, { force: true })
  if (!existsSync(paths.cliBinary))
    throw new Error(`解压后未找到 ${paths.cliBinary}`)
  if (process.platform !== 'win32')
    await chmod(paths.cliBinary, 0o755)
  ctx.log(`arduino-cli 已安装到 ${paths.cliBinary}`)
}
