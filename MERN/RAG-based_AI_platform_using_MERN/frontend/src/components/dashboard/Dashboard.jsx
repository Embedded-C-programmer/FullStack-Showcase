import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useUserStats, useDocuments, useChatSessions } from '../../hooks/useData'
import { formatDistanceToNow } from 'date-fns'

export default function Dashboard() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const { data: stats } = useUserStats()
  const { data: docsData } = useDocuments({ limit: 5 })
  const { data: sessions } = useChatSessions()

  const docs = docsData?.documents ?? []
  const recentSessions = (sessions ?? []).slice(0, 4)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-3xl font-semibold text-surface-50">
          {greeting}, {user?.name?.split(' ')[0]}.
        </h1>
        <p className="text-ink-muted mt-1 text-sm">Here's what's in your knowledge base.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Documents" value={stats?.documents ?? '—'} icon="◧" />
        <StatCard label="Chat Sessions" value={stats?.chatSessions ?? '—'} icon="◎" />
        <StatCard
          label="Storage Used"
          value={stats ? `${(stats.storageUsed / 1_048_576).toFixed(1)} MB` : '—'}
          icon="⬡"
        />
        <StatCard
          label="Storage Free"
          value={stats ? `${((stats.storageLimit - stats.storageUsed) / 1_048_576).toFixed(0)} MB` : '—'}
          icon="◈"
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <ActionCard
          title="Upload Document"
          desc="Add a PDF, DOCX, or Markdown file to your knowledge base."
          icon="↑"
          onClick={() => navigate('/documents')}
          accent
        />
        <ActionCard
          title="Start Chatting"
          desc="Ask questions and get answers from your documents."
          icon="◎"
          onClick={() => navigate('/chat')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent documents */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-surface-100">Recent Documents</h2>
            <button onClick={() => navigate('/documents')} className="text-xs text-accent hover:text-accent-light transition-colors">
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {docs.length === 0 ? (
              <EmptyState label="No documents yet" />
            ) : (
              docs.map((doc) => (
                <button
                  key={doc._id}
                  onClick={() => navigate(`/documents/${doc._id}`)}
                  className="w-full card-hover p-3.5 flex items-center gap-3 text-left"
                >
                  <FileIcon mime={doc.mimeType} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-100 truncate">{doc.title}</p>
                    <p className="text-xs text-ink-subtle mt-0.5">
                      {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <StatusDot status={doc.status} />
                </button>
              ))
            )}
          </div>
        </section>

        {/* Recent chats */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-surface-100">Recent Chats</h2>
            <button onClick={() => navigate('/chat')} className="text-xs text-accent hover:text-accent-light transition-colors">
              View all →
            </button>
          </div>
          <div className="space-y-2">
            {recentSessions.length === 0 ? (
              <EmptyState label="No chat sessions yet" />
            ) : (
              recentSessions.map((s) => (
                <button
                  key={s._id}
                  onClick={() => navigate(`/chat/${s._id}`)}
                  className="w-full card-hover p-3.5 flex items-center gap-3 text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-sm shrink-0">
                    ◎
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-100 truncate">{s.title}</p>
                    <p className="text-xs text-ink-subtle mt-0.5">
                      {s.messageCount} messages ·{' '}
                      {s.lastMessageAt
                        ? formatDistanceToNow(new Date(s.lastMessageAt), { addSuffix: true })
                        : 'new'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div className="card p-5">
      <div className="text-ink-subtle text-xl mb-3">{icon}</div>
      <div className="font-display text-2xl font-semibold text-surface-50">{value}</div>
      <div className="text-xs text-ink-muted mt-1">{label}</div>
    </div>
  )
}

function ActionCard({ title, desc, icon, onClick, accent }) {
  return (
    <button
      onClick={onClick}
      className={`card-hover p-5 text-left w-full group ${accent ? 'border-accent/30 hover:border-accent/60' : ''}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-4 ${accent ? 'bg-accent/15 text-accent' : 'bg-surface-800 text-ink-muted group-hover:text-surface-100'}`}>
        {icon}
      </div>
      <p className="font-medium text-surface-100 text-sm mb-1">{title}</p>
      <p className="text-xs text-ink-muted leading-relaxed">{desc}</p>
    </button>
  )
}

function FileIcon({ mime }) {
  const color = mime?.includes('pdf') ? 'text-status-failed' : mime?.includes('word') ? 'text-status-uploading' : 'text-ink-muted'
  return (
    <div className={`w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center text-sm shrink-0 ${color}`}>
      ◧
    </div>
  )
}

function StatusDot({ status }) {
  const map = { ready: 'bg-status-ready', processing: 'bg-status-processing', failed: 'bg-status-failed', uploading: 'bg-status-uploading' }
  return <span className={`w-2 h-2 rounded-full shrink-0 ${map[status] ?? 'bg-ink-subtle'}`} />
}

function EmptyState({ label }) {
  return (
    <div className="card p-6 text-center">
      <p className="text-ink-subtle text-sm">{label}</p>
    </div>
  )
}
