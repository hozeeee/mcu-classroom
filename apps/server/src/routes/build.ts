import type { CompileRequest, UploadRequest } from '@mcu/shared'
import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context'
import { getBoard } from '@mcu/shared'
import { compileSchema, uploadSchema } from './schemas'

/** 编译 / 烧录：校验后以任务形式异步执行，日志走 WS /ws/tasks */
export async function buildRoutes(app: FastifyInstance, ctx: AppContext): Promise<void> {
  app.post<{ Body: CompileRequest }>('/build/compile', { schema: { body: compileSchema } }, async (request) => {
    ctx.build.validate(request.body)
    const board = getBoard(request.body.boardId)!
    return ctx.tasks.start('compile', `编译 · ${board.name}`, task => ctx.build.compile(request.body, task))
  })

  app.post<{ Body: UploadRequest }>('/build/upload', { schema: { body: uploadSchema } }, async (request) => {
    ctx.build.validate(request.body)
    const board = getBoard(request.body.boardId)!
    return ctx.tasks.start('upload', `烧录 · ${board.name} → ${request.body.port}`, task => ctx.build.upload(request.body, task))
  })

  app.get('/serial/ports', async () => ctx.toolchain.listPorts())
}
