import type { ProjectInput } from '@mcu/shared'
import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context'
import { EXAMPLE_PROJECTS } from '@mcu/content'
import { getBoard } from '@mcu/shared'
import { badRequest, notFound } from '../utils/errors'
import { projectInputSchema, projectPatchSchema } from './schemas'

interface IdParams { Params: { id: string } }

function assertBoard(boardId: string | undefined): void {
  if (boardId && !getBoard(boardId))
    throw badRequest(`未知的开发板：${boardId}`)
}

/** 我的项目：代码 + 电路图，保存在 SQLite */
export async function projectRoutes(app: FastifyInstance, ctx: AppContext): Promise<void> {
  app.get('/projects', async () => ctx.projects.list())

  app.get<IdParams>('/projects/:id', async (request) => {
    const project = ctx.projects.get(request.params.id)
    if (!project)
      throw notFound('项目不存在')
    return project
  })

  app.post<{ Body: ProjectInput }>('/projects', { schema: { body: projectInputSchema } }, async (request, reply) => {
    assertBoard(request.body.boardId)
    reply.code(201)
    return ctx.projects.create(request.body)
  })

  /** 以示例项目为模板创建一份可编辑的副本 */
  app.post<IdParams>('/projects/from-example/:id', async (request, reply) => {
    const example = EXAMPLE_PROJECTS.find(item => item.id === request.params.id)
    if (!example)
      throw notFound('示例项目不存在')
    reply.code(201)
    return ctx.projects.create({
      name: example.title,
      boardId: example.boardId,
      code: example.code,
      circuit: structuredClone(example.circuit),
      exampleId: example.id,
    })
  })

  app.put<IdParams & { Body: Partial<ProjectInput> }>('/projects/:id', { schema: { body: projectPatchSchema } }, async (request) => {
    assertBoard(request.body.boardId)
    const project = ctx.projects.update(request.params.id, request.body)
    if (!project)
      throw notFound('项目不存在')
    return project
  })

  app.delete<IdParams>('/projects/:id', async (request, reply) => {
    if (!ctx.projects.remove(request.params.id))
      throw notFound('项目不存在')
    reply.code(204)
  })
}
