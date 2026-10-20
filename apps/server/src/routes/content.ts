import type { ContentCategories, SearchResult } from '@mcu/shared'
import type { FastifyInstance } from 'fastify'
import type { AppContext } from '../context'
import {
  ARTICLE_CATEGORIES,
  EXAMPLE_PROJECTS,
  MATERIAL_CATEGORIES,
  MATERIALS,
  ROADMAP,
  toProjectSummary,
  TROUBLESHOOT_CATEGORIES,
  TROUBLESHOOTING,
} from '@mcu/content'
import { notFound } from '../utils/errors'

/** 只读学习内容：文章、路线、物料、示例项目、排障手册 */
export async function contentRoutes(app: FastifyInstance, ctx: AppContext): Promise<void> {
  app.get('/content/categories', async (): Promise<ContentCategories> => ({
    articles: ARTICLE_CATEGORIES,
    materials: MATERIAL_CATEGORIES,
    troubleshooting: TROUBLESHOOT_CATEGORIES,
  }))

  app.get('/content/articles', async () => ctx.articles.list())

  app.get<{ Querystring: { q?: string } }>('/content/search', async (request): Promise<SearchResult> => {
    const q = request.query.q ?? ''
    const keyword = q.trim().toLowerCase()
    const articles = await ctx.articles.search(q)
    const materials = keyword
      ? MATERIALS.filter(item => `${item.name} ${item.summary}`.toLowerCase().includes(keyword)).map(({ id, name, icon, summary, category }) => ({ id, name, icon, summary, category }))
      : []
    const projects = keyword
      ? EXAMPLE_PROJECTS.filter(item => `${item.title} ${item.summary} ${item.tags.join(' ')}`.toLowerCase().includes(keyword)).map(toProjectSummary)
      : []
    return { articles, materials, projects }
  })

  app.get<{ Params: { category: string, slug: string } }>('/content/articles/:category/:slug', async (request) => {
    const article = await ctx.articles.get(request.params.category, request.params.slug)
    if (!article)
      throw notFound('文章不存在')
    return article
  })

  app.get('/content/roadmap', async () => ROADMAP)

  app.get('/content/materials', async () => MATERIALS)

  app.get('/content/examples', async () => EXAMPLE_PROJECTS.map(toProjectSummary))

  app.get<{ Params: { id: string } }>('/content/examples/:id', async (request) => {
    const project = EXAMPLE_PROJECTS.find(item => item.id === request.params.id)
    if (!project)
      throw notFound('示例项目不存在')
    return project
  })

  app.get('/content/troubleshooting', async () => TROUBLESHOOTING)
}
