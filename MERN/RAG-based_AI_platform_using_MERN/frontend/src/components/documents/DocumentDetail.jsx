import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useDocument, useDocumentStatus, useChatSessions, useDeleteDocument } from '../../hooks/useData'
import { useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'

const STATUS_BADGE = {
  ready:      { cls: 'badge-ready',      label: 'Ready' },
  processing: { cls: 'badge-processing', label: 'Processing…' },
  uploading:  { cls: 'badge-uploading',  label: 'Uploading' },
  failed:     { cls: 'badge-failed',     label: 'Failed' },
}

export default function DocumentDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()
  const qc        = useQueryClient()
  const deleteMut = useDeleteDocument()

  const [reprocessing, setReprocessing] = useState(false)
  const [reprocessMsg, setReprocessMsg] = useState('')

  const { data: doc, isLoading }  = useDocument(id)
  const { data: statusData }      = useDocumentStatus(id, doc?.status !== 'ready')
  const { data: sessions }        = useChatSessions(id)

  const status = statusData?.status ?? doc?.status ?? 'uploading'
  const badge  = STATUS_BADGE[status] ?? STATUS_BADGE.uploading

  const handleDelete = async () => {
    if (!confirm('Permanently delete this document and all its chat sessions?')) return
    await deleteMut.mutateAsync(doc._id)
    navigate('/documents')
  }

  const handleReprocess = async () => {
    setReprocessing(true)
    setReprocessMsg('')
    try {
      await api.post(`/documents/${id}/reprocess`)
      qc.invalidateQueries({ queryKey: ['document', id] })
      qc.invalidateQueries({ queryKey: ['document-status', id] })
      setReprocessMsg('Reprocessing started — this may take a few minutes for large files.')
    } catch (err) {
      setReprocessMsg(err.response?.data?.message || 'Reprocess request failed.')
    } finally {
      setReprocessing(false)
    }
  }

  if (isLoading) return <LoadingState />
  if (!doc)      return <NotFound onBack={() => navigate('/documents')} />

  const isFailed     = status === 'failed'
  const isProcessing = status === 'processing' || status === 'uploading'

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/documents')}
        className="btn-ghost text-xs px-2 py-1 mb-6"
      >
        ← Documents
      </button>

      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div
          style={{
            width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
            backgroundColor: '#1c1b18', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '1.5rem', color: '#6b6960',
            flexShrink: 0,
          }}
        >
          ◧
        </div>

        <div className="flex-1 min-w-0">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: '"Syne",sans-serif', fontSize: '1.5rem', fontWeight: 600, color: '#f8f8f6' }}>
              {doc.title}
            </h1>
            <span className={badge.cls}>{badge.label}</span>
          </div>
          {doc.description && (
            <p style={{ color: '#6b6960', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {doc.description}
            </p>
          )}
          <p style={{ color: '#9e9b92', fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Uploaded {format(new Date(doc.createdAt), 'PPP')} · {doc.originalName}
          </p>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          {isFailed && (
            <button
              onClick={handleReprocess}
              disabled={reprocessing}
              className="btn-outline"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
            >
              {reprocessing ? (
                <>
                  <span style={{
                    width: '0.75rem', height: '0.75rem', border: '2px solid rgba(255,255,255,0.2)',
                    borderTopColor: '#f0efe9', borderRadius: '9999px',
                    display: 'inline-block', animation: 'spin 1s linear infinite',
                  }} />
                  Reprocessing…
                </>
              ) : '↻ Reprocess'}
            </button>
          )}
          <button
            onClick={() => navigate(`/chat?documentId=${id}`)}
            className="btn-primary"
            disabled={status !== 'ready'}
          >
            ◎ Start Chat
          </button>
          <button onClick={handleDelete} className="btn-danger" style={{ padding: '0.4rem 0.75rem' }}>
            ✕
          </button>
        </div>
      </div>

      {/* Reprocess feedback */}
      {reprocessMsg && (
        <div style={{
          marginBottom: '1.5rem', padding: '0.75rem 1rem', borderRadius: '0.5rem',
          backgroundColor: isFailed ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.08)',
          border: `1px solid ${isFailed ? 'rgba(248,113,113,0.2)' : 'rgba(74,222,128,0.2)'}`,
          color: isFailed ? '#f87171' : '#4ade80', fontSize: '0.875rem',
        }}>
          {reprocessMsg}
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="File Size"  value={`${(doc.fileSize / 1024).toFixed(0)} KB`} />
        <StatCard label="Words"      value={doc.wordCount?.toLocaleString() ?? '—'} />
        <StatCard label="Chunks"     value={doc.chunkCount?.toLocaleString() ?? '—'} />
        <StatCard label="Chats"      value={doc.chatCount ?? 0} />
      </div>

      {/* Processing error */}
      {isFailed && doc.processingError && (
        <div style={{
          padding: '1rem', borderRadius: '0.75rem', marginBottom: '2rem',
          border: '1px solid rgba(248,113,113,0.3)', backgroundColor: 'rgba(248,113,113,0.05)',
        }}>
          <p style={{ color: '#f87171', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
            Processing failed
          </p>
          <p style={{ color: '#9e9b92', fontSize: '0.75rem', fontFamily: '"JetBrains Mono",monospace', lineHeight: 1.6 }}>
            {doc.processingError}
          </p>
          <p style={{ color: '#6b6960', fontSize: '0.75rem', marginTop: '0.75rem' }}>
            Click <strong style={{ color: '#f0efe9' }}>↻ Reprocess</strong> above to retry without re-uploading.
            Make sure the Python AI service is running at{' '}
            <code style={{ color: '#d4a843', fontSize: '0.7rem' }}>http://localhost:8000</code>.
          </p>
        </div>
      )}

      {/* Processing spinner */}
      {isProcessing && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem',
          borderRadius: '0.75rem', backgroundColor: '#111109', border: '1px solid #1c1b18', marginBottom: '2rem',
        }}>
          <div style={{
            width: '1.25rem', height: '1.25rem', borderRadius: '9999px',
            border: '2px solid rgba(250,204,21,0.3)', borderTopColor: '#facc15',
            animation: 'spin 1s linear infinite', flexShrink: 0,
          }} />
          <div>
            <p style={{ color: '#f0efe9', fontSize: '0.875rem', fontWeight: 500 }}>
              Processing document…
            </p>
            <p style={{ color: '#6b6960', fontSize: '0.75rem', marginTop: '0.25rem' }}>
              Parsing, chunking, and embedding. Large PDFs may take 2–5 minutes on CPU.
            </p>
          </div>
        </div>
      )}

      {/* Tags */}
      {doc.tags?.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6b6960', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
            Tags
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {doc.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '0.25rem 0.75rem', borderRadius: '9999px',
                  backgroundColor: '#1c1b18', color: '#e2e0d8',
                  fontSize: '0.75rem', border: '1px solid #2a2920',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Chat sessions */}
      <div>
        <p style={{ fontFamily: '"Syne",sans-serif', fontWeight: 600, color: '#f0efe9', marginBottom: '1rem', fontSize: '1rem' }}>
          Chat Sessions
        </p>
        {!sessions?.length ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#6b6960', fontSize: '0.875rem', marginBottom: '1rem' }}>
              No chats yet for this document.
            </p>
            {status === 'ready' && (
              <button
                onClick={() => navigate(`/chat?documentId=${id}`)}
                className="btn-primary"
                style={{ margin: '0 auto' }}
              >
                ◎ Start first chat
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sessions.map((s) => (
              <button
                key={s._id}
                onClick={() => navigate(`/chat/${s._id}`)}
                className="card-hover"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '1rem', width: '100%', textAlign: 'left',
                }}
              >
                <div style={{
                  width: '2.25rem', height: '2.25rem', borderRadius: '0.5rem',
                  backgroundColor: 'rgba(212,168,67,0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: '#d4a843',
                  fontSize: '0.875rem', flexShrink: 0,
                }}>
                  ◎
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#f0efe9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.title}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#9e9b92', marginTop: '0.125rem' }}>
                    {s.messageCount} messages
                  </p>
                </div>
                <span style={{ color: '#6b6960', fontSize: '0.875rem' }}>→</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="card" style={{ padding: '1rem' }}>
      <p style={{ fontSize: '0.75rem', color: '#6b6960', marginBottom: '0.375rem' }}>{label}</p>
      <p style={{ fontFamily: '"Syne",sans-serif', fontSize: '1.25rem', fontWeight: 600, color: '#f8f8f6' }}>
        {value}
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '16rem' }}>
      <div style={{
        width: '1.5rem', height: '1.5rem', borderRadius: '9999px',
        border: '2px solid rgba(212,168,67,0.3)', borderTopColor: '#d4a843',
        animation: 'spin 1s linear infinite',
      }} />
    </div>
  )
}

function NotFound({ onBack }) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p style={{ color: '#6b6960', marginBottom: '1rem' }}>Document not found.</p>
      <button onClick={onBack} className="btn-ghost">← Back to documents</button>
    </div>
  )
}
