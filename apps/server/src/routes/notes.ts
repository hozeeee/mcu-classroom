import type { NoteInput } from '@mcu/shared'
import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context'
import { notFound } from '../utils/errors'
import { noteInputSchema, notePatchSchema } from './schemas'

interface IdParams { Params: { id: string } }

/** 学习笔记：可关联到文章或项目（ref 形如 article:what-is-mcu） */
export async function noteRoutes(app: FastifyInstance, ctx: AppContext): Promise<void> {
  app.get<{ Querystring: { ref?: string } }>('/notes', async request => ctx.notes.list(request.query.ref))

  app.get<IdParams>('/notes/:id', async (request) => {
    const note = ctx.notes.get(request.params.id)
    if (!note)
      throw notFound('笔记不存在')
    return note
  })

  app.post<{ Body: NoteInput }>('/notes', { schema: { body: noteInputSchema } }, async (request, reply) => {
    reply.code(201)
    return ctx.notes.create(request.body)
  })

  app.put<IdParams & { Body: Partial<NoteInput> }>('/notes/:id', { schema: { body: notePatchSchema } }, async (request) => {
    const note = ctx.notes.update(request.params.id, request.body)
    if (!note)
      throw notFound('笔记不存在')
    return note
  })

  app.delete<IdParams>('/notes/:id', async (request, reply) => {
    if (!ctx.notes.remove(request.params.id))
      throw notFound('笔记不存在')
    reply.code(204)
  })
}
