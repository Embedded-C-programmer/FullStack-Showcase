import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'

export default function SettingsPage() {
  const { user, refreshUser } = useAuth()

  const [profile, setProfile]       = useState({ name: user?.name ?? '' })
  const [passwords, setPasswords]   = useState({ current: '', newPass: '', confirm: '' })
  const [profileMsg, setProfileMsg] = useState({ text: '', ok: true })
  const [passMsg, setPassMsg]       = useState({ text: '', ok: true })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPass, setSavingPass]       = useState(false)

  const saveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await api.patch('/users/me', { name: profile.name })
      await refreshUser()
      setProfileMsg({ text: 'Profile updated.', ok: true })
    } catch (err) {
      setProfileMsg({ text: err.response?.data?.message || 'Error updating profile.', ok: false })
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    if (passwords.newPass !== passwords.confirm) {
      setPassMsg({ text: 'Passwords do not match.', ok: false })
      return
    }
    setSavingPass(true)
    try {
      await api.patch('/users/me/password', {
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      })
      setPasswords({ current: '', newPass: '', confirm: '' })
      setPassMsg({ text: 'Password changed successfully.', ok: true })
    } catch (err) {
      setPassMsg({ text: err.response?.data?.message || 'Error changing password.', ok: false })
    } finally {
      setSavingPass(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="mb-10">
        <h1 className="font-display text-2xl font-semibold text-surface-50">Settings</h1>
        <p className="text-ink-muted text-sm mt-1">Manage your account preferences.</p>
      </div>

      {/* Account info */}
      <section className="card p-6 mb-6">
        <h2 className="font-display font-semibold text-surface-100 mb-1">Account</h2>
        <p className="text-xs text-ink-muted mb-5">{user?.email}</p>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-xl">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-surface-100">{user?.name}</p>
            <p className="text-xs text-ink-subtle capitalize mt-0.5">{user?.role} account</p>
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-muted mb-1.5">Display Name</label>
            <input
              className="input max-w-sm"
              value={profile.name}
              onChange={(e) => setProfile({ name: e.target.value })}
              required
            />
          </div>
          {profileMsg.text && (
            <p className={`text-sm ${profileMsg.ok ? 'text-status-ready' : 'text-status-failed'}`}>
              {profileMsg.text}
            </p>
          )}
          <button type="submit" className="btn-primary" disabled={savingProfile}>
            {savingProfile ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </section>

      {/* Password */}
      <section className="card p-6 mb-6">
        <h2 className="font-display font-semibold text-surface-100 mb-1">Password</h2>
        <p className="text-xs text-ink-muted mb-5">Choose a strong password of at least 8 characters.</p>

        <form onSubmit={savePassword} className="space-y-4">
          {[
            { label: 'Current password', key: 'current' },
            { label: 'New password',     key: 'newPass' },
            { label: 'Confirm new',      key: 'confirm' },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-ink-muted mb-1.5">{label}</label>
              <input
                type="password"
                className="input max-w-sm"
                value={passwords[key]}
                onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                required
                minLength={key !== 'current' ? 8 : undefined}
              />
            </div>
          ))}
          {passMsg.text && (
            <p className={`text-sm ${passMsg.ok ? 'text-status-ready' : 'text-status-failed'}`}>
              {passMsg.text}
            </p>
          )}
          <button type="submit" className="btn-primary" disabled={savingPass}>
            {savingPass ? 'Updating…' : 'Change password'}
          </button>
        </form>
      </section>

      {/* Danger zone */}
      <section className="card p-6 border-status-failed/20">
        <h2 className="font-display font-semibold text-surface-100 mb-1">Danger Zone</h2>
        <p className="text-xs text-ink-muted mb-5">
          Deleting your account is permanent and cannot be undone.
        </p>
        <button
          className="btn-danger"
          onClick={() => alert('Account deletion requires contacting support.')}
        >
          Delete account
        </button>
      </section>
    </div>
  )
}
