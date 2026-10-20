import type { NoteInput } from '@mcu/shared'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../api'

export function useNotes(ref?: string) {
  return useQuery({ queryKey: ['notes', ref ?? 'all'], queryFn: () => api.notes(ref) })
}

function useInvalidateNotes() {
  const client = useQueryClient()
  return () => client.invalidateQueries({ queryKey: ['notes'] })
}

export function useCreateNote() {
  const invalidate = useInvalidateNotes()
  return useMutation({ mutationFn: (input: NoteInput) => api.createNote(input), onSuccess: invalidate })
}

export function useUpdateNote() {
  const invalidate = useInvalidateNotes()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string, patch: Partial<NoteInput> }) => api.updateNote(id, patch),
    onSuccess: invalidate,
  })
}

export function useDeleteNote() {
  const invalidate = useInvalidateNotes()
  return useMutation({ mutationFn: (id: string) => api.deleteNote(id), onSuccess: invalidate })
}
