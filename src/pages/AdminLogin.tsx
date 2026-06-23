import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { useAuth } from '../hooks/useAuth'

interface Props {
  auth: ReturnType<typeof useAuth>
}

export function AdminLogin({ auth }: Props) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const ok = await auth.login(password)
    setLoading(false)
    if (ok) {
      navigate('/admin')
    } else {
      setError('Mot de passe incorrect')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="Rouge-Gorge" className="rounded-full object-cover mx-auto mb-4" style={{ width: 80, height: 80 }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Interface d'administration
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border p-6 space-y-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input-base w-full px-4 py-3 rounded-xl border text-sm"
              placeholder="••••••••"
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-opacity disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center mt-4">
          <a href="/" className="text-xs" style={{ color: 'var(--text-muted)' }}>
            ← Retour à la carte
          </a>
        </p>
      </div>
    </div>
  )
}
