import type { ArticleMeta } from '@mcu/shared'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { api } from '../api'

/** 内容数据基本不变，缓存久一点 */
const STATIC = { staleTime: 10 * 60 * 1000 }

export const useSystemInfo = () => useQuery({ queryKey: ['system'], queryFn: api.system, ...STATIC })

export const useCategories = () => useQuery({ queryKey: ['categories'], queryFn: api.categories, ...STATIC })

export const useArticles = () => useQuery({ queryKey: ['articles'], queryFn: api.articles, ...STATIC })

export function useArticle(category: string, slug: string) {
  return useQuery({ queryKey: ['article', category, slug], queryFn: () => api.article(category, slug), ...STATIC })
}

export function useSearch(q: string) {
  return useQuery({ queryKey: ['search', q], queryFn: () => api.search(q), enabled: q.trim().length > 0 })
}

export const useRoadmap = () => useQuery({ queryKey: ['roadmap'], queryFn: api.roadmap, ...STATIC })

export const useMaterials = () => useQuery({ queryKey: ['materials'], queryFn: api.materials, ...STATIC })

export const useExamples = () => useQuery({ queryKey: ['examples'], queryFn: api.examples, ...STATIC })

export function useExample(id: string | undefined) {
  return useQuery({ queryKey: ['example', id], queryFn: () => api.example(id!), enabled: Boolean(id), ...STATIC })
}

export const useTroubleshooting = () => useQuery({ queryKey: ['troubleshooting'], queryFn: api.troubleshooting, ...STATIC })

/** slug → 文章元信息，用于把路线 / 项目中引用的 slug 转成链接 */
export function useArticleIndex(): Map<string, ArticleMeta> {
  const { data } = useArticles()
  return useMemo(() => new Map((data ?? []).map(item => [item.slug, item])), [data])
}
