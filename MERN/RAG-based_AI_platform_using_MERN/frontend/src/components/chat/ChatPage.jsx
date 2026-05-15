import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { formatDistanceToNow } from 'date-fns'
import {
  useChatSessions,
  useChatSession,
  useCreateSession,
  useSendMessage,
  useDeleteSession,
  useDocuments,
} from '../../hooks/useData'
import clsx from 'clsx'

export default function ChatPage() {
  const { sessionId }    = useParams()
  const [params]         = useSearchParams()
  const navigate         = useNavigate()
  const preselectedDocId = params.get('documentId')

  const { data: sessions, isLoading: sessionsLoading } = useChatSessions()
  const { data: session }  = useChatSession(sessionId)
  const { data: docsData } = useDocuments({ status: 'ready', limit: 100 })
  const createSession      = useCreateSession()
  const deleteSession      = useDeleteSession()

  const readyDocs = docsData?.documents ?? []

  // Auto-create session when arriving with ?documentId=
  useEffect(() => {
    if (preselectedDocId && !sessionId && readyDocs.length > 0) {
      const doc = readyDocs.find((d) => d._id === preselectedDocId)
      if (doc) {
        createSession.mutateAsync({ documentId: doc._id }).then((s) => {
          navigate(`/chat/${s._id}`, { replace: true })
        })
      }
    }
  }, [preselectedDocId, sessionId, readyDocs]) // eslint-disable-line

  const handleNewChat = async (docId) => {
    try {
      const s = await createSession.mutateAsync({ documentId: docId })
      navigate(`/chat/${s._id}`)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-surface-800 bg-surface-900 flex flex-col">
        <div className="p-4 border-b border-surface-800">
          <h2 className="font-display font-semibold text-surface-100 text-sm mb-3">Chat Sessions</h2>
          <NewChatButton docs={readyDocs} onCreate={handleNewChat} loading={createSession.isPending} />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {sessionsLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-5 h-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          ) : !sessions?.length ? (
            <p className="text-xs text-ink-subtle text-center py-8 px-4">
              No sessions yet. Upload a document and start chatting.
            </p>
          ) : (
            sessions.map((s) => (
              <SessionItem
                key={s._id}
                session={s}
                active={s._id === sessionId}
                onSelect={() => navigate(`/chat/${s._id}`)}
                onDelete={() => {
                  deleteSession.mutate(s._id)
                  if (s._id === sessionId) navigate('/chat')
                }}
              />
            ))
          )}
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {sessionId && session ? (
          <ChatArea session={session} />
        ) : (
          <EmptyChat docs={readyDocs} onCreate={handleNewChat} />
        )}
      </div>
    </div>
  )
}

function ChatArea({ session }) {
  const [input, setInput]   = useState('')
  const messagesEndRef       = useRef(null)
  const textareaRef          = useRef(null)
  const sendMessage          = useSendMessage(session._id)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [session.messages, scrollToBottom])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sendMessage.isPending) return
    setInput('')
    try {
      await sendMessage.mutateAsync(text)
    } catch (err) {
      console.error(err)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-800 bg-surface-900 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-sm">◎</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-100 truncate">{session.title}</p>
          <p className="text-xs text-ink-subtle truncate">{session.document?.title}</p>
        </div>
        <span className="text-xs text-ink-subtle">{session.messages?.length ?? 0} messages</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {!session.messages?.length ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-4xl mb-4 text-ink-subtle">◎</div>
            <p className="text-surface-200 font-medium mb-2">Ask anything about this document</p>
            <p className="text-ink-muted text-sm max-w-xs">
              I'll search through the content and give you grounded answers with source references.
            </p>
          </div>
        ) : (
          <>
            {session.messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}
            {sendMessage.isPending && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 px-6 py-4 border-t border-surface-800 bg-surface-900">
        <div className="flex items-end gap-3 bg-surface-800 rounded-xl border border-surface-700 focus-within:border-accent/50 transition-colors px-4 py-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about this document…"
            className="flex-1 bg-transparent text-surface-100 placeholder:text-ink-subtle text-sm resize-none focus:outline-none max-h-32 leading-relaxed"
            rows={1}
            style={{ minHeight: '1.5rem' }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = e.target.scrollHeight + 'px'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
            className="btn-primary px-3 py-2 shrink-0 self-end"
          >
            {sendMessage.isPending ? (
              <span className="w-4 h-4 border-2 border-surface-950/30 border-t-surface-950 rounded-full animate-spin" />
            ) : '↑'}
          </button>
        </div>
        <p className="text-xs text-ink-subtle mt-2 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={clsx('flex gap-3 animate-slide-up', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={clsx(
        'w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5',
        isUser ? 'bg-accent/20 text-accent' : 'bg-surface-800 text-ink-muted'
      )}>
        {isUser ? 'U' : 'N'}
      </div>

      {/* Bubble */}
      <div className={clsx('max-w-[75%] space-y-3', isUser && 'items-end flex flex-col')}>
        <div className={clsx(
          'rounded-2xl px-4 py-3',
          isUser
            ? 'bg-accent/15 border border-accent/20 text-surface-100 text-sm'
            : 'bg-surface-800 border border-surface-700'
        )}>
          {isUser ? (
            <p className="text-sm leading-relaxed">{message.content}</p>
          ) : (
            <div className="prose-chat text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources?.length > 0 && (
          <SourcesPanel sources={message.sources} />
        )}

        {/* Meta */}
        <p className="text-xs text-ink-subtle px-1">
          {message.latencyMs ? `${(message.latencyMs / 1000).toFixed(1)}s` : ''}
          {message.tokensUsed ? ` · ${message.tokensUsed} tokens` : ''}
        </p>
      </div>
    </div>
  )
}

function SourcesPanel({ sources }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-ink-muted hover:text-accent transition-colors"
      >
        <span className="text-accent/60">◈</span>
        {sources.length} source{sources.length > 1 ? 's' : ''} referenced
        <span className="ml-1">{open ? '↑' : '↓'}</span>
      </button>
      {open && (
        <div className="mt-2 space-y-2 animate-slide-up">
          {sources.map((src, i) => (
            <div key={i} className="bg-surface-900 border border-surface-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-ink-subtle font-mono">Chunk #{src.chunkIndex}</span>
                <span className="text-xs text-accent font-medium">{(src.score * 100).toFixed(0)}% match</span>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed line-clamp-3">{src.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-surface-800 flex items-center justify-center text-sm text-ink-muted shrink-0">N</div>
      <div className="bg-surface-800 border border-surface-700 rounded-2xl px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-ink-subtle animate-thinking"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}

function SessionItem({ session, active, onSelect, onDelete }) {
  return (
    <div
      onClick={onSelect}
      className={clsx(
        'flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer group transition-all duration-150',
        active ? 'bg-surface-800 text-surface-100' : 'text-ink-muted hover:text-surface-100 hover:bg-surface-800/60'
      )}
    >
      <div className="w-4 h-4 text-xs text-accent/60 shrink-0">◎</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{session.title}</p>
        <p className="text-[10px] text-ink-subtle truncate">
          {session.document?.title ?? ''}
        </p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-ink-subtle hover:text-status-failed transition-all text-xs"
      >
        ✕
      </button>
    </div>
  )
}

function NewChatButton({ docs, onCreate, loading }) {
  const [open, setOpen] = useState(false)
  if (!docs.length) return (
    <p className="text-xs text-ink-subtle text-center py-2">
      Upload a ready document first.
    </p>
  )
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={loading}
        className="btn-primary w-full justify-center text-xs py-2"
      >
        {loading ? <span className="w-3 h-3 border border-surface-950/30 border-t-surface-950 rounded-full animate-spin" /> : '+'}
        New Chat
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface-800 border border-surface-700 rounded-lg shadow-card-md z-20 max-h-48 overflow-y-auto animate-slide-up">
          {docs.map((d) => (
            <button
              key={d._id}
              onClick={() => { onCreate(d._id); setOpen(false) }}
              className="w-full px-3 py-2.5 text-left text-xs text-surface-200 hover:bg-surface-700 transition-colors truncate"
            >
              {d.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyChat({ docs, onCreate }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm animate-fade-in">
        <div className="text-5xl mb-5 text-ink-subtle">◎</div>
        <h2 className="font-display text-xl font-semibold text-surface-100 mb-2">
          Start a conversation
        </h2>
        <p className="text-ink-muted text-sm mb-8 leading-relaxed">
          Select a session from the sidebar, or create a new chat from one of your ready documents.
        </p>
        {docs.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-ink-subtle mb-3">Quick start with:</p>
            {docs.slice(0, 3).map((d) => (
              <button
                key={d._id}
                onClick={() => onCreate(d._id)}
                className="w-full card-hover p-3.5 flex items-center gap-3 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center text-ink-muted text-sm">◧</div>
                <span className="text-sm text-surface-200 truncate">{d.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
