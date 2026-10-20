import type { Article, ArticleCategory, ArticleMeta, Difficulty } from '@mcu/shared'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced']

function parseArticle(category: ArticleCategory, slug: string, raw: string): Article {
  const { data, content } = matter(raw)
  const difficulty = DIFFICULTIES.includes(data.difficulty) ? data.difficulty as Difficulty : 'beginner'
  return {
    slug,
    category,
    title: String(data.title ?? slug),
    summary: String(data.summary ?? ''),
    difficulty,
    minutes: Number(data.minutes ?? 5),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    order: Number(data.order ?? 99),
    body: content.trim(),
  }
}

/**
 * 文章仓库：启动时扫描 articles/<category>/<slug>.md 并缓存在内存中。
 * 文章数量很少，全部缓存即可，开发时调用 reload() 刷新。
 */
export function createArticleStore(articlesDir: string) {
  let cache: Map<string, Article> | null = null

  async function load(): Promise<Map<string, Article>> {
    const result = new Map<string, Article>()
    const categories = await readdir(articlesDir, { withFileTypes: true })
    for (const dir of categories) {
      if (!dir.isDirectory())
        continue
      const category = dir.name as ArticleCategory
      const files = await readdir(path.join(articlesDir, category))
      for (const file of files.filter(name => name.endsWith('.md'))) {
        const slug = file.replace(/\.md$/, '')
        const raw = await readFile(path.join(articlesDir, category, file), 'utf8')
        result.set(`${category}/${slug}`, parseArticle(category, slug, raw))
      }
    }
    return result
  }

  async function ensure(): Promise<Map<string, Article>> {
    cache ??= await load()
    return cache
  }

  return {
    async list(): Promise<ArticleMeta[]> {
      const articles = [...(await ensure()).values()]
      return articles
        .map(({ body: _body, ...meta }) => meta)
        .sort((a, b) => a.category.localeCompare(b.category) || a.order - b.order)
    },

    async get(category: string, slug: string): Promise<Article | undefined> {
      return (await ensure()).get(`${category}/${slug}`)
    },

    /** 简单全文检索：标题、摘要、标签、正文 */
    async search(keyword: string): Promise<ArticleMeta[]> {
      const q = keyword.trim().toLowerCase()
      if (!q)
        return []
      const articles = [...(await ensure()).values()]
      return articles
        .filter(item => [item.title, item.summary, item.tags.join(' '), item.body].some(text => text.toLowerCase().includes(q)))
        .map(({ body: _body, ...meta }) => meta)
    },

    reload(): void {
      cache = null
    },
  }
}

export type ArticleStore = ReturnType<typeof createArticleStore>
