import type { FastifyError, FastifyInstance } from 'fastify'
import type { AppOptions } from './config'
import type { AppContext } from './context'
import { existsSync } from 'node:fs'
import path from 'node:path'
import cors from '@fastify/cors'
import fastifyStatic from '@fastify/static'
import websocket from '@fastify/websocket'
import { API_PREFIX } from '@mcu/shared'
import Fastify from 'fastify'
import { openDatabase } from './db'
import { createNoteRepo } from './db/notes'
import { createProgressRepo } from './db/progress'
import { createProjectRepo } from './db/projects'
import { registerRoutes } from './routes'
import { createArticleStore } from './services/articles'
import { BuildService } from './services/build'
import { SerialManager } from './services/serial'
import { TaskManager } from './services/tasks'
import { ToolchainService } from './services/toolchain'
import { HttpError } from './utils/errors'
import { serialSocket } from './ws/serial'
import { taskSocket } from './ws/tasks'

export type { AppOptions, ListenOptions } from './config'
export { defaultDataDir, resolveListenOptions } from './config'

function createAppContext(options: AppOptions): AppContext {
  const db = openDatabase(options.dataDir)
  const toolchain = new ToolchainService(options.dataDir)
  const serial = new SerialManager(toolchain.cli)
  return {
    options,
    articles: createArticleStore(options.articlesDir),
    projects: createProjectRepo(db),
    progress: createProgressRepo(db),
    notes: createNoteRepo(db),
    tasks: new TaskManager(),
    toolchain,
    serial,
    build: new BuildService(toolchain, serial),
  }
}

function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler<FastifyError | HttpError>((error, request, reply) => {
    if (error instanceof HttpError)
      return reply.code(error.statusCode).send({ message: error.message })
    if ('validation' in error && error.validation)
      return reply.code(400).send({ message: `参数校验失败：${error.message}` })
    request.log.error(error)
    return reply.code(error.statusCode ?? 500).send({ message: error.message || '服务器内部错误' })
  })
}

/** 生产 / 桌面端：托管前端静态资源，非 API 路径回退到 index.html（SPA） */
async function registerStatic(app: FastifyInstance, webDir: string): Promise<void> {
  await app.register(fastifyStatic, { root: path.resolve(webDir), wildcard: false })
  app.setNotFoundHandler((request, reply) => {
    const url = request.raw.url ?? ''
    if (request.method !== 'GET' || url.startsWith(API_PREFIX) || url.startsWith('/ws/'))
      return reply.code(404).send({ message: `接口不存在：${request.method} ${url}` })
    return reply.sendFile('index.html')
  })
}

export async function createApp(options: AppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: options.logger ?? false, bodyLimit: 5 * 1024 * 1024 })
  const ctx = createAppContext(options)

  registerErrorHandler(app)
  // 只允许本机页面跨域访问（开发时 Vite 走代理，一般用不到）
  await app.register(cors, { origin: [/^https?:\/\/localhost(?::\d+)?$/, /^https?:\/\/127\.0\.0\.1(?::\d+)?$/] })
  await app.register(websocket)
  await app.register(async (api) => {
    await registerRoutes(api, ctx)
  }, { prefix: API_PREFIX })
  await app.register(async (ws) => {
    await taskSocket(ws, ctx)
    await serialSocket(ws, ctx)
  })

  if (options.webDir && existsSync(path.join(options.webDir, 'index.html')))
    await registerStatic(app, options.webDir)

  app.addHook('onClose', async () => {
    ctx.serial.closeAll()
  })
  return app
}
