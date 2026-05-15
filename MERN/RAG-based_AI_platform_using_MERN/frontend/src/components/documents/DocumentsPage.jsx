import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { formatDistanceToNow, format } from 'date-fns'
import { useDocuments, useDeleteDocument } from '../../hooks/useData'
import { useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import clsx from 'clsx'

const STATUS_BADGE = {
  ready:      { cls: 'badge-ready',      dot: 'bg-status-ready',      label: 'Ready' },
  processing: { cls: 'badge-processing', dot: 'bg-status-processing animate-pulse', label: 'Processing' },
  uploading:  { cls: 'badge-uploading',  dot: 'bg-status-uploading',  label: 'Uploading' },
  failed:     { cls: 'badge-failed',     dot: 'bg-status-failed',     label: 'Failed' },
}

export default function DocumentsPage() {
  const navigate  = useNavigate()
  const qc        = useQueryClient()
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const { data, isLoading } = useDocuments({ search: search || undefined })
  const deleteMut = useDeleteDocument()

  const docs = data?.documents ?? []

  const onDrop = useCallback(async (accepted) => {
    if (!accepted.length) return
    setUploading(true)
    setUploadError('')
    try {
      for (const file of accepted) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('title', file.name.replace(/\.[^/.]+$/, ''))
        await api.post('/documents/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      }
      qc.invalidateQueries({ queryKey: ['documents'] })
      qc.invalidateQueries({ queryKey: ['user-stats'] })
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }, [qc])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/markdown': ['.md'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: true,
  })

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete this document and all its chat sessions?')) return
    deleteMut.mutate(id)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-surface-50">Documents</h1>
        <p className="text-ink-muted text-sm mt-1">Upload and manage your knowledge base.</p>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-10 text-center cursor-pointer mb-8 transition-all duration-200',
          isDragActive
            ? 'border-accent bg-accent/5 shadow-glow'
            : 'border-surface-700 hover:border-surface-500 bg-surface-900/50'
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            <p className="text-ink-muted text-sm">Uploading…</p>
          </div>
        ) : (
          <>
            <div className="text-3xl mb-3 text-ink-subtle">↑</div>
            <p className="text-surface-200 font-medium text-sm mb-1">
              {isDragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}
            </p>
            <p className="text-ink-subtle text-xs">PDF, DOCX, TXT, MD — max 10 MB each</p>
          </>
        )}
      </div>

      {uploadError && (
        <div className="mb-6 text-sm text-status-failed bg-status-failed/10 border border-status-failed/20 rounded-lg px-4 py-3">
          {uploadError}
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-subtle text-sm">⌕</span>
          <input
            className="input pl-8"
            placeholder="Search documents…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="text-xs text-ink-subtle">{docs.length} document{docs.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>
      ) : docs.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-4xl mb-4 text-ink-subtle">◧</div>
          <p className="text-ink-muted text-sm">{search ? 'No documents match your search.' : 'Upload your first document to get started.'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => {
            const badge = STATUS_BADGE[doc.status] ?? STATUS_BADGE.uploading
            return (
              <div
                key={doc._id}
                onClick={() => navigate(`/documents/${doc._id}`)}
                className="card-hover p-4 flex items-center gap-4 cursor-pointer group"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center text-ink-muted group-hover:text-accent transition-colors shrink-0 text-base">
                  ◧
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-surface-100 truncate">{doc.title}</span>
                    <span className={badge.cls}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-ink-subtle">
                    <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                    {doc.wordCount && <span>·</span>}
                    {doc.wordCount && <span>{doc.wordCount.toLocaleString()} words</span>}
                    {doc.chunkCount && <span>·</span>}
                    {doc.chunkCount && <span>{doc.chunkCount} chunks</span>}
                    <span>·</span>
                    <span>{formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => navigate(`/chat?documentId=${doc._id}`)}
                    className="btn-ghost text-xs px-3 py-1.5"
                    disabled={doc.status !== 'ready'}
                  >
                    Chat
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, doc._id)}
                    className="p-1.5 rounded-lg text-ink-subtle hover:text-status-failed hover:bg-status-failed/10 transition-colors text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
