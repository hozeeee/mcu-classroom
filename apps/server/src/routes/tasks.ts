import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context'
import { notFound } from '../utils/errors'

export async function taskRoutes(app: FastifyInstance, ctx: AppContext): Promise<void> {
  app.get('/tasks', async () => ctx.tasks.list())

  app.get<{ Params: { id: string } }>('/tasks/:id', async (request) => {
    const task = ctx.tasks.get(request.params.id)
    if (!task)
      throw notFound('任务不存在或已过期')
    return task
  })
}
