import { spawn } from 'node:child_process'

export interface RunOptions {
  cwd?: string
  env?: NodeJS.ProcessEnv
  /** 逐行回调，用于实时推送日志 */
  onLine?: (line: string, stream: 'stdout' | 'stderr') => void
  signal?: AbortSignal
}

export interface RunResult {
  code: number
  stdout: string
  stderr: string
}

/** 按行切分流数据，保留未结束的半行；\r 刷新的进度条只保留最终状态 */
function createLineSplitter(emit: (line: string) => void) {
  let buffer = ''
  const emitLine = (line: string) => {
    const visible = line.split('\r').filter(Boolean).pop()?.trimEnd()
    if (visible)
      emit(visible)
  }
  return {
    push(chunk: string) {
      buffer += chunk
      const lines = buffer.split(/\r?\n/)
      buffer = lines.pop() ?? ''
      lines.forEach(emitLine)
    },
    flush() {
      if (buffer)
        emitLine(buffer)
      buffer = ''
    },
  }
}

/** 运行外部命令并收集输出，不会因为非 0 退出码而抛错 */
export function runCommand(command: string, args: string[], options: RunOptions = {}): Promise<RunResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      signal: options.signal,
      windowsHide: true,
    })
    let stdout = ''
    let stderr = ''
    const out = createLineSplitter(line => options.onLine?.(line, 'stdout'))
    const err = createLineSplitter(line => options.onLine?.(line, 'stderr'))

    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk
      out.push(chunk)
    })
    child.stderr.on('data', (chunk: string) => {
      stderr += chunk
      err.push(chunk)
    })
    child.on('error', reject)
    child.on('close', (code) => {
      out.flush()
      err.flush()
      resolve({ code: code ?? -1, stdout, stderr })
    })
  })
}
