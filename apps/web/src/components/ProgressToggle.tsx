import type { ProgressStatus, ProgressTargetType } from '@mcu/shared'
import { CheckCircleFilled, ClockCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { Segmented } from 'antd'
import { useProgressMap, useSetProgress } from '../queries/progress'

interface ProgressToggleProps {
  type: ProgressTargetType
  id: string
}

/** 文章 / 项目页上的进度切换 */
export function ProgressToggle({ type, id }: ProgressToggleProps) {
  const map = useProgressMap()
  const setProgress = useSetProgress()
  const value = map.get(`${type}:${id}`) ?? 'todo'

  return (
    <Segmented<ProgressStatus>
      value={value}
      onChange={status => setProgress.mutate({ targetType: type, targetId: id, status })}
      options={[
        { value: 'todo', label: '未开始', icon: <MinusCircleOutlined /> },
        { value: 'doing', label: '学习中', icon: <ClockCircleOutlined /> },
        { value: 'done', label: '已完成', icon: <CheckCircleFilled /> },
      ]}
    />
  )
}
