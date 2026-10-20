import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context'
import { getSystemInfo } from '../services/system'

export async function systemRoutes(app: FastifyInstance, ctx: AppContext): Promise<void> {
  app.get('/health', async () => ({ ok: true }))

  app.get('/system', async () => getSystemInfo(ctx.options))
}
