import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'

// ─── Documents ────────────────────────────────────────────────────────────────

export function useDocuments(params = {}) {
  return useQuery({
    queryKey: ['documents', params],
    queryFn: () => api.get('/documents', { params }).then((r) => r.data.data),
  })
}

export function useDocument(id) {
  return useQuery({
    queryKey: ['document', id],
    queryFn: () => api.get(`/documents/${id}`).then((r) => r.data.data.document),
    enabled: !!id,
  })
}

export function useDocumentStatus(id, enabled) {
  return useQuery({
    queryKey: ['document-status', id],
    queryFn: () => api.get(`/documents/${id}/status`).then((r) => r.data.data),
    enabled: !!id && enabled,
    refetchInterval: (data) => {
      if (!data) return 3000
      return data.status === 'processing' || data.status === 'uploading' ? 3000 : false
    },
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/documents/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['documents'] }),
  })
}

export function useUpdateDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }) => api.patch(`/documents/${id}`, body),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['documents'] })
      qc.invalidateQueries({ queryKey: ['document', id] })
    },
  })
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export function useChatSessions(documentId) {
  return useQuery({
    queryKey: ['sessions', documentId],
    queryFn: () =>
      api
        .get('/chat/sessions', { params: documentId ? { documentId } : {} })
        .then((r) => r.data.data.sessions),
    enabled: true,
  })
}

export function useChatSession(id) {
  return useQuery({
    queryKey: ['session', id],
    queryFn: () => api.get(`/chat/sessions/${id}`).then((r) => r.data.data.session),
    enabled: !!id,
  })
}

export function useCreateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => api.post('/chat/sessions', body).then((r) => r.data.data.session),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  })
}

export function useSendMessage(sessionId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content) =>
      api.post(`/chat/sessions/${sessionId}/messages`, { content }).then((r) => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['session', sessionId] }),
  })
}

export function useDeleteSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.delete(`/chat/sessions/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  })
}

// ─── User stats ───────────────────────────────────────────────────────────────

export function useUserStats() {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: () => api.get('/users/me/stats').then((r) => r.data.data),
    staleTime: 60_000,
  })
}
