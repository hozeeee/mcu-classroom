import type { AppOptions } from './config'
import type { NoteRepo } from './db/notes'
import type { ProgressRepo } from './db/progress'
import type { ProjectRepo } from './db/projects'
import type { ArticleStore } from './services/articles'
import type { BuildService } from './services/build'
import type { SerialManager } from './services/serial'
import type { TaskManager } from './services/tasks'
import type { ToolchainService } from './services/toolchain'

/** 路由层依赖的全部服务，由 createApp 统一组装后注入 */
export interface AppContext {
  options: AppOptions
  articles: ArticleStore
  projects: ProjectRepo
  progress: ProgressRepo
  notes: NoteRepo
  tasks: TaskManager
  toolchain: ToolchainService
  serial: SerialManager
  build: BuildService
}
