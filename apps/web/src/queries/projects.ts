import type { ProjectInput } from '@mcu/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'

export const useProjects = () => useQuery({ queryKey: ['projects'], queryFn: api.projects })

export function useProject(id: string | undefined) {
  return useQuery({ queryKey: ['project', id], queryFn: () => api.project(id!), enabled: Boolean(id) })
}

export function useCreateProject() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: ProjectInput) => api.createProject(input),
    onSuccess: () => client.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useCreateFromExample() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (exampleId: string) => api.createProjectFromExample(exampleId),
    onSuccess: () => client.invalidateQueries({ queryKey: ['projects'] }),
  })
}

export function useUpdateProject() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string, patch: Partial<ProjectInput> }) => api.updateProject(id, patch),
    onSuccess: (project) => {
      client.setQueryData(['project', project.id], project)
      void client.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useDeleteProject() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => client.invalidateQueries({ queryKey: ['projects'] }),
  })
}
