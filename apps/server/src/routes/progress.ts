import type { ProgressStatus, ProgressTargetType } from '@mcu/shared'
import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context'
import { progressSchema } from './schemas'

interface ProgressBody {
  targetType: ProgressTargetType
  targetId: string
  status: ProgressStatus
}

/** 学习进度：文章 / 项目的完成状态 */
export async function progressRoutes(app: FastifyInstance, ctx: AppContext): Promise<void> {
  app.get('/progress', async () => ctx.progress.list())

  app.put<{ Body: ProgressBody }>('/progress', { schema: { body: progressSchema } }, async (request) => {
    const { targetType, targetId, status } = request.body
    return { record: ctx.progress.set(targetType, targetId, status) }
  })

  app.delete('/progress', async (_request, reply) => {
    ctx.progress.reset()
    reply.code(204)
  })
}
