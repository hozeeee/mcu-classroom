import type { ReactNode } from 'react'
import {
  ApiOutlined,
  BookOutlined,
  BuildOutlined,
  CalculatorOutlined,
  CodeOutlined,
  EditOutlined,
  ExperimentOutlined,
  HomeOutlined,
  LineChartOutlined,
  NodeIndexOutlined,
  ShoppingOutlined,
  ToolOutlined,
  WarningOutlined,
} from '@ant-design/icons'

export interface MenuEntry {
  path: string
  label: string
  icon: ReactNode
}

export interface MenuGroup {
  key: string
  label: string
  items: MenuEntry[]
}

/** 侧边菜单：按「学 → 练 → 查 → 记」组织 */
export const MENU_GROUPS: MenuGroup[] = [
  {
    key: 'home',
    label: '首页',
    items: [{ path: '/', label: '首页', icon: <HomeOutlined /> }],
  },
  {
    key: 'learn',
    label: '学习',
    items: [
      { path: '/roadmap', label: '学习路线', icon: <NodeIndexOutlined /> },
      { path: '/library', label: '知识库', icon: <BookOutlined /> },
      { path: '/materials', label: '物料百科', icon: <ShoppingOutlined /> },
      { path: '/projects', label: '实战项目', icon: <BuildOutlined /> },
    ],
  },
  {
    key: 'practice',
    label: '实操',
    items: [
      { path: '/workbench', label: '工作台', icon: <CodeOutlined /> },
      { path: '/circuit', label: '电路实验室', icon: <ExperimentOutlined /> },
      { path: '/serial', label: '串口监视器', icon: <ApiOutlined /> },
      { path: '/toolbox', label: '工具箱', icon: <CalculatorOutlined /> },
    ],
  },
  {
    key: 'help',
    label: '帮助',
    items: [
      { path: '/environment', label: '环境中心', icon: <ToolOutlined /> },
      { path: '/troubleshooting', label: '排障手册', icon: <WarningOutlined /> },
    ],
  },
  {
    key: 'me',
    label: '我的',
    items: [
      { path: '/progress', label: '学习进度', icon: <LineChartOutlined /> },
      { path: '/notes', label: '学习笔记', icon: <EditOutlined /> },
    ],
  },
]

export const ALL_MENU_ENTRIES = MENU_GROUPS.flatMap(group => group.items)

/** 根据当前路径找到高亮的菜单项（最长前缀匹配） */
export function matchMenuPath(pathname: string): string {
  const matched = ALL_MENU_ENTRIES
    .filter(entry => entry.path === '/' ? pathname === '/' : pathname.startsWith(entry.path))
    .sort((a, b) => b.path.length - a.path.length)[0]
  return matched?.path ?? '/'
}
