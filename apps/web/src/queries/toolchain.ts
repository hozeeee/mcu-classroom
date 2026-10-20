import { useQuery } from '@tanstack/react-query'
import { api } from '../api'

export const useToolchainStatus = () => useQuery({ queryKey: ['toolchain'], queryFn: api.toolchainStatus })

export function useInstalledLibraries(enabled = true) {
  return useQuery({ queryKey: ['libraries'], queryFn: api.installedLibraries, enabled })
}

export function useLibrarySearch(q: string) {
  return useQuery({ queryKey: ['library-search', q], queryFn: () => api.searchLibraries(q), enabled: q.trim().length > 1 })
}

export function usePorts() {
  return useQuery({ queryKey: ['ports'], queryFn: api.ports, retry: false })
}
