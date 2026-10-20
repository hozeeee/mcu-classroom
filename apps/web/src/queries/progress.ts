import type { ProgressRecord, ProgressStatus, ProgressTargetType } from '@mcu/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { api } from '../api'

export const useProgress = () => useQuery({ queryKey: ['progress'], queryFn: api.progress })

/** 以 `${type}:${id}` 为键的进度索引，便于各页面快速查询 */
export function useProgressMap(): Map<string, ProgressStatus> {
  const { data } = useProgress()
  return useMemo(() => new Map((data ?? []).map(item => [`${item.targetType}:${item.targetId}`, item.status])), [data])
}

export function useSetProgress() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ targetType, targetId, status }: { targetType: ProgressTargetType, targetId: string, status: ProgressStatus }) =>
      api.setProgress(targetType, targetId, status),
    // 乐观更新：点击后立即反馈
    onMutate: async ({ targetType, targetId, status }) => {
      await client.cancelQueries({ queryKey: ['progress'] })
      client.setQueryData<ProgressRecord[]>(['progress'], (old = []) => {
        const rest = old.filter(item => !(item.targetType === targetType && item.targetId === targetId))
        return status === 'todo' ? rest : [{ targetType, targetId, status, updatedAt: new Date().toISOString() }, ...rest]
      })
    },
    onSettled: () => client.invalidateQueries({ queryKey: ['progress'] }),
  })
}

export function useResetProgress() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: api.resetProgress,
    onSuccess: () => client.invalidateQueries({ queryKey: ['progress'] }),
  })
}
