import type { Difficulty, ProgressStatus } from '@mcu/shared'

export const DIFFICULTY_META: Record<Difficulty, { label: string, color: string }> = {
  beginner: { label: '入门', color: 'green' },
  intermediate: { label: '进阶', color: 'orange' },
  advanced: { label: '高级', color: 'red' },
}

export const PROGRESS_META: Record<ProgressStatus, { label: string, color: string }> = {
  todo: { label: '未开始', color: 'default' },
  doing: { label: '学习中', color: 'processing' },
  done: { label: '已完成', color: 'success' },
}
