import type { TaskInfo } from '@mcu/shared'
import { App } from 'antd'
import { useCallback, useState } from 'react'
import { api } from '../../api'
import { useTaskRunner } from '../../hooks/useTaskRunner'

interface BuildOutput {
  boardId: string
  code: string
  hex?: string
  sizeSummary?: string
}

/**
 * 编译 / 烧录（后端 arduino-cli 执行），并缓存最近一次编译结果供仿真使用：
 * const build = useBuild(boardId, code)
 * await build.compile() / await build.upload('COM3') / await build.ensureHex()
 */
export function useBuild(boardId: string, code: string) {
  const { message } = App.useApp()
  const { run, taskId, running } = useTaskRunner()
  const [output, setOutput] = useState<BuildOutput>()
  const upToDate = output?.boardId === boardId && output.code === code

  const report = useCallback((info: TaskInfo, success: string) => {
    if (info.status === 'success')
      void message.success(success)
    else
      void message.error(info.error ?? '任务失败，请查看输出日志')
  }, [message])

  const compile = useCallback(async (): Promise<BuildOutput | undefined> => {
    try {
      const info = await run(() => api.compile({ boardId, code }))
      report(info, '编译成功')
      if (info.status !== 'success')
        return undefined
      const next: BuildOutput = { boardId, code, hex: info.result?.artifacts.hex, sizeSummary: info.result?.sizeSummary }
      setOutput(next)
      return next
    }
    catch (error) {
      void message.error((error as Error).message)
      return undefined
    }
  }, [boardId, code, message, report, run])

  const upload = useCallback(async (port: string) => {
    try {
      const info = await run(() => api.upload({ boardId, code, port }))
      report(info, '烧录成功！程序已经在板子上运行了')
    }
    catch (error) {
      void message.error((error as Error).message)
    }
  }, [boardId, code, message, report, run])

  /** 仿真需要 HEX：代码没变则复用上次编译结果，否则先编译 */
  const ensureHex = useCallback(async (): Promise<string | undefined> => {
    const result = upToDate ? output : await compile()
    if (result && !result.hex)
      void message.error('编译产物中没有 HEX 文件，无法仿真')
    return result?.hex
  }, [compile, message, output, upToDate])

  return { compile, upload, ensureHex, taskId, running, upToDate, sizeSummary: output?.sizeSummary }
}
