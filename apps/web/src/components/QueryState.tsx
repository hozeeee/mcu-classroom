import type { ReactNode } from 'react'
import { Button, Empty, Result, Skeleton } from 'antd'

interface QueryStateProps {
  loading: boolean
  error?: unknown
  empty?: boolean
  emptyText?: string
  onRetry?: () => void
  children: ReactNode
}

/** 统一处理加载中 / 出错 / 空数据三种状态 */
export function QueryState({ loading, error, empty, emptyText = '暂无数据', onRetry, children }: QueryStateProps) {
  if (loading)
    return <Skeleton active paragraph={{ rows: 6 }} />
  if (error) {
    return (
      <Result
        status="warning"
        title="加载失败"
        subTitle={`${error instanceof Error ? error.message : String(error)}。请确认后端服务已启动（pnpm dev）。`}
        extra={onRetry && <Button onClick={onRetry}>重试</Button>}
      />
    )
  }
  if (empty)
    return <Empty description={emptyText} />
  return <>{children}</>
}
