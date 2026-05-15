import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useUserStats } from '../../hooks/useData'
import clsx from 'clsx'

const NAV = [
  { to: '/',          label: 'Dashboard',  icon: '⊞', end: true },
  { to: '/documents', label: 'Documents',  icon: '◧' },
  { to: '/chat',      label: 'Chat',       icon: '◎' },
  { to: '/settings',  label: 'Settings',   icon: '⚙' },
]

export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { data: stats } = useUserStats()

  const handleLogout = () => { logout(); navigate('/auth') }

  const storagePct = stats?.storagePercent ?? 0
  const storageUsedMB = stats ? (stats.storageUsed / 1_048_576).toFixed(1) : '—'
  const storageLimitMB = stats ? (stats.storageLimit / 1_048_576).toFixed(0) : '—'

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* Sidebar */}
      <aside className="flex flex-col w-60 shrink-0 border-r border-surface-800 bg-surface-900 px-3 py-5">
        {/* Wordmark */}
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <span className="font-display font-bold text-surface-950 text-sm">N</span>
          </div>
          <span className="font-display font-semibold text-surface-100 text-base tracking-tight">Nexus</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-0.5">
          {NAV.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(isActive ? 'nav-item-active' : 'nav-item')
              }
            >
              <span className="text-base w-5 text-center opacity-70">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Storage meter */}
        {stats && (
          <div className="px-2 mb-4">
            <div className="flex justify-between text-xs text-ink-subtle mb-1.5">
              <span>Storage</span>
              <span>{storageUsedMB} / {storageLimitMB} MB</span>
            </div>
            <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${Math.min(storagePct, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* User row */}
        <div className="flex items-center gap-3 px-2 pt-4 border-t border-surface-800">
          <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-100 truncate">{user?.name}</p>
            <p className="text-xs text-ink-subtle truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-ink-subtle hover:text-status-failed hover:bg-status-failed/10 transition-colors"
          >
            ⇥
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
