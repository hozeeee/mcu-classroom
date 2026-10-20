import type { CompileRequest, CompileResult, UploadRequest } from '@mcu/shared'
import type { SerialManager } from './serial'
import type { TaskContext } from './tasks'
import type { ToolchainService } from './toolchain'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getBoard, getCore } from '@mcu/shared'
import { badRequest } from '../utils/errors'

const FQBN_PATTERN = /^[\w.-]+:[\w.-]+:[\w.-]+(?::[\w=,.-]+)?$/
const SIZE_LINE = /^(?:Sketch uses|Global variables use)/

interface SketchLocation {
  sketchDir: string
  buildDir: string
  fqbn: string
  family: string
}

/** 编译与烧录服务：把代码写入固定工作区后调用 arduino-cli */
export class BuildService {
  constructor(private toolchain: ToolchainService, private serial: SerialManager) {}

  validate(request: CompileRequest): void {
    const board = getBoard(request.boardId)
    if (!board)
      throw badRequest(`未知的开发板：${request.boardId}`)
    if (request.fqbn && !FQBN_PATTERN.test(request.fqbn))
      throw badRequest(`FQBN 格式不正确：${request.fqbn}`)
    if (!request.code.trim())
      throw badRequest('代码不能为空')
  }

  async compile(request: CompileRequest, ctx: TaskContext): Promise<CompileResult> {
    const location = await this.prepare(request)
    ctx.log(`开始编译（${location.fqbn}）…`)
    const result = await this.toolchain.cli.run(
      ['compile', '--fqbn', location.fqbn, '--output-dir', location.buildDir, location.sketchDir],
      { onLine: (line, stream) => ctx.log(line, stream) },
    )
    if (result.code !== 0)
      throw new Error(this.explainCompileFailure(result.stderr, location.fqbn))

    const sizeSummary = result.stdout.split(/\r?\n/).filter(line => SIZE_LINE.test(line)).join('\n') || undefined
    const hexFile = path.join(location.buildDir, 'sketch.ino.hex')
    const hex = location.family === 'avr' && existsSync(hexFile) ? await readFile(hexFile, 'utf8') : undefined
    ctx.log('✔ 编译成功')
    return { fqbn: location.fqbn, artifacts: { hex }, sizeSummary }
  }

  async upload(request: UploadRequest, ctx: TaskContext): Promise<CompileResult> {
    if (!request.port)
      throw badRequest('请选择串口')
    const compiled = await this.compile(request, ctx)
    const location = this.locate(request)

    if (this.serial.close(request.port, '正在烧录，串口监视器已暂时断开'))
      ctx.log(`已关闭 ${request.port} 上的串口监视器`)

    ctx.log(`开始烧录到 ${request.port}…`)
    await this.toolchain.cli.exec(
      ['upload', '-p', request.port, '--fqbn', location.fqbn, '--input-dir', location.buildDir, location.sketchDir],
      { onLine: (line, stream) => ctx.log(line, stream) },
    )
    ctx.log('✔ 烧录完成，程序已开始运行')
    return compiled
  }

  private locate(request: CompileRequest): SketchLocation {
    const board = getBoard(request.boardId)!
    const root = path.join(this.toolchain.paths.workspaceDir, board.id)
    return {
      sketchDir: path.join(root, 'sketch'),
      buildDir: path.join(root, 'build'),
      fqbn: request.fqbn || board.fqbn,
      family: board.family,
    }
  }

  private async prepare(request: CompileRequest): Promise<SketchLocation> {
    this.validate(request)
    const location = this.locate(request)
    await mkdir(location.sketchDir, { recursive: true })
    await mkdir(location.buildDir, { recursive: true })
    // arduino-cli 要求 .ino 文件名与目录名一致
    await writeFile(path.join(location.sketchDir, 'sketch.ino'), request.code, 'utf8')
    return location
  }

  private explainCompileFailure(stderr: string, fqbn: string): string {
    if (/platform not installed|Platform '.+' not found/i.test(stderr)) {
      const coreId = fqbn.split(':').slice(0, 2).join(':')
      return `尚未安装开发板核心 ${getCore(coreId)?.name ?? coreId}，请到「环境中心」安装`
    }
    const firstError = stderr.split(/\r?\n/).find(line => /error:/i.test(line))
    return firstError ? `编译失败：${firstError.trim().replace(/^.*[\\/]sketch\.ino:/, 'sketch.ino:')}` : '编译失败，请查看输出日志'
  }
}
