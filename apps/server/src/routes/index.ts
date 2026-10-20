import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context'
import { buildRoutes } from './build'
import { contentRoutes } from './content'
import { noteRoutes } from './notes'
import { progressRoutes } from './progress'
import { projectRoutes } from './projects'
import { systemRoutes } from './system'
import { taskRoutes } from './tasks'
import { toolchainRoutes } from './toolchain'

const ROUTES = [systemRoutes, contentRoutes, projectRoutes, progressRoutes, noteRoutes, toolchainRoutes, buildRoutes, taskRoutes]

/** 注册全部 REST 路由（调用方负责加 /api 前缀） */
export async function registerRoutes(app: FastifyInstance, ctx: AppContext): Promise<void> {
  for (const route of ROUTES)
    await route(app, ctx)
}
