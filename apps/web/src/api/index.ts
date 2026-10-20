import type {
  Article,
  ArticleMeta,
  CompileRequest,
  ContentCategories,
  ExampleProject,
  ExampleProjectSummary,
  LibraryInfo,
  Material,
  Note,
  NoteInput,
  ProgressRecord,
  ProgressStatus,
  ProgressTargetType,
  Project,
  ProjectInput,
  ProjectSummary,
  RoadmapStage,
  SearchResult,
  SerialPortInfo,
  SystemInfo,
  TaskInfo,
  ToolchainStatus,
  TroubleshootItem,
  UploadRequest,
} from '@mcu/shared'
import { http } from './client'

export type TaskDetail = TaskInfo & { logs: string[] }

/** 所有后端接口集中定义，页面通过 queries/ 中的 hooks 使用 */
export const api = {
  system: () => http.get<SystemInfo>('/system'),

  categories: () => http.get<ContentCategories>('/content/categories'),
  articles: () => http.get<ArticleMeta[]>('/content/articles'),
  article: (category: string, slug: string) => http.get<Article>(`/content/articles/${category}/${slug}`),
  search: (q: string) => http.get<SearchResult>(`/content/search?q=${encodeURIComponent(q)}`),
  roadmap: () => http.get<RoadmapStage[]>('/content/roadmap'),
  materials: () => http.get<Material[]>('/content/materials'),
  examples: () => http.get<ExampleProjectSummary[]>('/content/examples'),
  example: (id: string) => http.get<ExampleProject>(`/content/examples/${id}`),
  troubleshooting: () => http.get<TroubleshootItem[]>('/content/troubleshooting'),

  projects: () => http.get<ProjectSummary[]>('/projects'),
  project: (id: string) => http.get<Project>(`/projects/${id}`),
  createProject: (input: ProjectInput) => http.post<Project>('/projects', input),
  createProjectFromExample: (exampleId: string) => http.post<Project>(`/projects/from-example/${exampleId}`),
  updateProject: (id: string, patch: Partial<ProjectInput>) => http.put<Project>(`/projects/${id}`, patch),
  deleteProject: (id: string) => http.delete(`/projects/${id}`),

  progress: () => http.get<ProgressRecord[]>('/progress'),
  setProgress: (targetType: ProgressTargetType, targetId: string, status: ProgressStatus) =>
    http.put<{ record: ProgressRecord | null }>('/progress', { targetType, targetId, status }),
  resetProgress: () => http.delete('/progress'),

  notes: (ref?: string) => http.get<Note[]>(ref ? `/notes?ref=${encodeURIComponent(ref)}` : '/notes'),
  createNote: (input: NoteInput) => http.post<Note>('/notes', input),
  updateNote: (id: string, patch: Partial<NoteInput>) => http.put<Note>(`/notes/${id}`, patch),
  deleteNote: (id: string) => http.delete(`/notes/${id}`),

  toolchainStatus: () => http.get<ToolchainStatus>('/toolchain/status'),
  installCli: () => http.post<TaskInfo>('/toolchain/cli/install'),
  installCore: (id: string) => http.post<TaskInfo>('/toolchain/cores/install', { id }),
  searchLibraries: (q: string) => http.get<LibraryInfo[]>(`/toolchain/libraries/search?q=${encodeURIComponent(q)}`),
  installedLibraries: () => http.get<LibraryInfo[]>('/toolchain/libraries'),
  installLibrary: (name: string) => http.post<TaskInfo>('/toolchain/libraries/install', { name }),

  ports: () => http.get<SerialPortInfo[]>('/serial/ports'),
  compile: (request: CompileRequest) => http.post<TaskInfo>('/build/compile', request),
  upload: (request: UploadRequest) => http.post<TaskInfo>('/build/upload', request),

  tasks: () => http.get<TaskInfo[]>('/tasks'),
  task: (id: string) => http.get<TaskDetail>(`/tasks/${id}`),
}
