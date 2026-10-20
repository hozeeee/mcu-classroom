import type { Difficulty } from '@mcu/shared'
import { Tag } from 'antd'
import { DIFFICULTY_META } from '../constants/meta'

export function DifficultyTag({ value }: { value: Difficulty }) {
  const meta = DIFFICULTY_META[value]
  return <Tag color={meta.color}>{meta.label}</Tag>
}
