import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context'
import { getCore } from '@mcu/shared'
import { badRequest } from '../utils/errors'
import { idSchema, nameSchema } from './schemas'

/** 环境中心：arduino-cli、开发板核心与库管理 */
export async function toolchainRoutes(app: FastifyInstance, ctx: AppContext): Promise<void> {
  app.get('/toolchain/status', async () => ctx.toolchain.status())

  app.post('/toolchain/cli/install', async () => {
    if (ctx.tasks.isBusy('install-cli'))
      throw badRequest('arduino-cli 正在安装中')
    return ctx.tasks.start('install-cli', '安装 arduino-cli', task => ctx.toolchain.installCli(task))
  })

  app.post<{ Body: { id: string } }>('/toolchain/cores/install', { schema: { body: idSchema } }, async (request) => {
    const core = getCore(request.body.id)
    if (!core)
      throw badRequest(`未知的开发板核心：${request.body.id}`)
    return ctx.tasks.start('install-core', `安装 ${core.name}`, task => ctx.toolchain.installCore(core.id, task))
  })

  app.get<{ Querystring: { q?: string } }>('/toolchain/libraries/search', async (request) => {
    const q = request.query.q?.trim()
    if (!q)
      return []
    return ctx.toolchain.searchLibraries(q)
  })

  app.get('/toolchain/libraries', async () => ctx.toolchain.listLibraries())

  app.post<{ Body: { name: string } }>('/toolchain/libraries/install', { schema: { body: nameSchema } }, async (request) => {
    const { name } = request.body
    return ctx.tasks.start('install-lib', `安装库 ${name}`, task => ctx.toolchain.installLibrary(name, task))
  })
}
