import type { ComponentType } from 'react'
import type { RouteHandle } from './layouts/AppLayout'
import { Spin } from 'antd'
import { createBrowserRouter } from 'react-router'
import { AppLayout } from './layouts/AppLayout'

/** 页面按路由懒加载：每个页面文件 default export 一个组件 */
function page(load: () => Promise<{ default: ComponentType }>) {
  return async () => ({ Component: (await load()).default })
}

const full: RouteHandle = { full: true }

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppLayout,
    hydrateFallbackElement: <Spin style={{ display: 'block', margin: '120px auto' }} />,
    children: [
      { index: true, lazy: page(() => import('./pages/home/HomePage')) },
      { path: 'roadmap', lazy: page(() => import('./pages/roadmap/RoadmapPage')) },
      { path: 'library', lazy: page(() => import('./pages/library/LibraryPage')) },
      { path: 'library/:category/:slug', lazy: page(() => import('./pages/library/ArticlePage')) },
      { path: 'materials', lazy: page(() => import('./pages/materials/MaterialsPage')) },
      { path: 'projects', lazy: page(() => import('./pages/projects/ProjectsPage')) },
      { path: 'projects/:id', lazy: page(() => import('./pages/projects/ProjectDetailPage')) },
      { path: 'workbench', lazy: page(() => import('./pages/workbench/WorkbenchPage')), handle: full },
      { path: 'circuit', lazy: page(() => import('./pages/circuit/CircuitLabPage')), handle: full },
      { path: 'serial', lazy: page(() => import('./pages/serial/SerialPage')) },
      { path: 'toolbox', lazy: page(() => import('./pages/toolbox/ToolboxPage')) },
      { path: 'environment', lazy: page(() => import('./pages/environment/EnvironmentPage')) },
      { path: 'troubleshooting', lazy: page(() => import('./pages/troubleshooting/TroubleshootingPage')) },
      { path: 'progress', lazy: page(() => import('./pages/progress/ProgressPage')) },
      { path: 'notes', lazy: page(() => import('./pages/notes/NotesPage')) },
      { path: '*', lazy: page(() => import('./pages/NotFoundPage')) },
    ],
  },
])
