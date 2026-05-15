import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function AuthPage() {
  const [mode, setMode]       = useState('login')
  const [form, setForm]       = useState({ name: '', email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register }   = useAuth()
  const navigate              = useNavigate()

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form.name, form.email, form.password)
      }
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-surface-900 border-r border-surface-800 p-14">
        <div>
          <Wordmark />
          <p className="mt-4 text-ink-muted text-sm leading-relaxed max-w-xs">
            Upload documents. Ask questions. Get answers grounded in your own knowledge base.
          </p>
        </div>

        <div className="space-y-5">
          {FEATURES.map((f) => (
            <div key={f.label} className="flex items-start gap-3">
              <div className="mt-0.5 w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0 text-sm">
                {f.icon}
              </div>
              <div>
                <div className="text-sm font-medium text-surface-100">{f.label}</div>
                <div className="text-xs text-ink-muted mt-0.5">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-ink-subtle">© 2025 Nexus. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="lg:hidden mb-10">
            <Wordmark />
          </div>

          <h1 className="font-display text-2xl font-semibold text-surface-50 mb-1">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-ink-muted text-sm mb-8">
            {mode === 'login'
              ? 'Sign in to your knowledge base.'
              : 'Start building your AI-powered knowledge base.'}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1.5">Full name</label>
                <input
                  className="input"
                  placeholder="Ada Lovelace"
                  value={form.name}
                  onChange={set('name')}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1.5">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="ada@example.com"
                value={form.email}
                onChange={set('email')}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ink-muted mb-1.5">Password</label>
              <input
                type="password"
                className="input"
                placeholder={mode === 'register' ? 'Min. 8 characters' : '••••••••'}
                value={form.password}
                onChange={set('password')}
                required
                minLength={8}
              />
            </div>

            {error && (
              <div className="text-status-failed text-sm bg-status-failed/10 border border-status-failed/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button type="submit" className="btn-primary w-full justify-center py-2.5" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-surface-950/30 border-t-surface-950 rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : mode === 'login' ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-muted">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
              className="text-accent hover:text-accent-light transition-colors font-medium"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function Wordmark() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
        <span className="font-display font-bold text-surface-950 text-sm">N</span>
      </div>
      <span className="font-display font-semibold text-surface-100 text-lg tracking-tight">Nexus</span>
    </div>
  )
}

const FEATURES = [
  { icon: '⬡', label: 'Semantic Search', desc: 'FAISS vector search across all your documents' },
  { icon: '◈', label: 'RAG-Powered Chat', desc: 'LLM answers grounded in your own content' },
  { icon: '⊞', label: 'Multi-Document', desc: 'Upload PDFs, DOCX, Markdown, and plain text' },
  { icon: '◎', label: 'Isolated Namespaces', desc: 'Your data is never mixed with other users' },
]
