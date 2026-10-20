import type { CircuitDoc } from './circuit'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type ArticleCategory
  = | 'start'
    | 'basics'
    | 'hardware'
    | 'programming'
    | 'protocols'
    | 'platforms'
    | 'practice'

export interface ArticleMeta {
  slug: string
  category: ArticleCategory
  title: string
  summary: string
  difficulty: Difficulty
  /** 预计阅读/实践时长（分钟） */
  minutes: number
  tags: string[]
  order: number
}

export interface Article extends ArticleMeta {
  body: string
}

export interface ArticleCategoryInfo {
  id: ArticleCategory
  name: string
  description: string
}

export type RoadmapItemType = 'article' | 'project' | 'tool' | 'page'

export interface RoadmapItem {
  type: RoadmapItemType
  /** article: slug；project: 项目 id；tool / page: 前端路由 */
  ref: string
  title: string
}

export interface RoadmapStage {
  id: string
  title: string
  subtitle: string
  goal: string
  weeks: string
  skills: string[]
  items: RoadmapItem[]
}

export type MaterialCategory
  = | 'board'
    | 'basic'
    | 'sensor'
    | 'actuator'
    | 'display'
    | 'module'
    | 'power'
    | 'tool'

export interface Material {
  id: string
  name: string
  category: MaterialCategory
  /** 列表展示用的 emoji 图标 */
  icon: string
  summary: string
  specs: Record<string, string>
  usage: string
  /** 引脚说明 */
  pins?: { name: string, desc: string }[]
  price: string
  buyTips: string
  /** 入门套件必备 */
  essential: boolean
  cautions?: string[]
}

export interface MaterialCategoryInfo {
  id: MaterialCategory
  name: string
}

export interface ProjectMaterial {
  materialId: string
  quantity: number
  note?: string
}

export interface WiringStep {
  from: string
  to: string
  note?: string
}

export interface ExampleProject {
  id: string
  title: string
  summary: string
  difficulty: Difficulty
  boardId: string
  tags: string[]
  /** 涉及的知识点（文章 slug） */
  articles: string[]
  materials: ProjectMaterial[]
  wiring: WiringStep[]
  /** Markdown 说明：原理、步骤、扩展练习 */
  guide: string
  code: string
  circuit: CircuitDoc
}

export type ExampleProjectSummary = Omit<ExampleProject, 'code' | 'circuit' | 'guide' | 'wiring'>

export interface TroubleshootItem {
  id: string
  category: 'driver' | 'upload' | 'compile' | 'serial' | 'circuit' | 'power' | 'simulator'
  title: string
  symptoms: string[]
  causes: string[]
  solutions: string[]
  /** 仅特定系统出现时标注 */
  os?: ('windows' | 'macos' | 'linux')[]
}

export interface ContentCategories {
  articles: ArticleCategoryInfo[]
  materials: MaterialCategoryInfo[]
  troubleshooting: { id: TroubleshootItem['category'], name: string }[]
}

export interface SearchResult {
  articles: ArticleMeta[]
  materials: Pick<Material, 'id' | 'name' | 'icon' | 'summary' | 'category'>[]
  projects: ExampleProjectSummary[]
}
