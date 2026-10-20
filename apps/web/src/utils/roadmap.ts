import type { ArticleMeta, ProgressStatus, RoadmapItem, RoadmapStage } from '@mcu/shared'

/** 路线条目对应的前端路由；文章只存 slug，需要文章索引补全分类 */
export function roadmapItemPath(item: RoadmapItem, articles: Map<string, ArticleMeta>): string {
  switch (item.type) {
    case 'article': {
      const meta = articles.get(item.ref)
      return meta ? `/library/${meta.category}/${meta.slug}` : '/library'
    }
    case 'project':
      return `/projects/${item.ref}`
    default:
      return item.ref
  }
}

/** 只有文章和项目参与进度统计 */
export function progressKey(item: RoadmapItem): string | undefined {
  return item.type === 'article' || item.type === 'project' ? `${item.type}:${item.ref}` : undefined
}

export interface RoadmapStats {
  total: number
  done: number
  percent: number
  /** 第一个未完成的条目 */
  next?: { stage: RoadmapStage, item: RoadmapItem }
}

export function computeRoadmapStats(stages: RoadmapStage[], progress: Map<string, ProgressStatus>, onlyStage?: string): RoadmapStats {
  let total = 0
  let done = 0
  let next: RoadmapStats['next']
  for (const stage of stages) {
    if (onlyStage && stage.id !== onlyStage)
      continue
    for (const item of stage.items) {
      const key = progressKey(item)
      if (!key)
        continue
      total++
      if (progress.get(key) === 'done')
        done++
      else if (!next)
        next = { stage, item }
    }
  }
  return { total, done, percent: total ? Math.round((done / total) * 100) : 0, next }
}
