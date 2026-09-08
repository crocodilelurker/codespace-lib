import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import { useAuthStore } from '../store/auth.store'
import { Spinner } from '../components/Spinner'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('all fields are required'); return }
    setLoading(true)
    try {
      const res = await login(form.email, form.password)
      const { id, name, email, accessToken, refreshToken } = res.data.data
      setAuth({ id, name, email }, accessToken, refreshToken)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'login failed')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'var(--bg)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ fontSize: '1.25rem', color: 'var(--text)', letterSpacing: '-0.02em' }}>ditchdocs</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--subtext)' }}>sign in to continue</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label className="label" htmlFor="login-email">email</label>
            <input
              id="login-email"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="login-password">password</label>
            <input
              id="login-password"
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div
              style={{
                padding: '8px 12px',
                background: 'var(--danger-dim)',
                borderRadius: 6,
                fontSize: '0.8125rem',
                color: 'var(--danger)',
                border: '1px solid rgba(224,82,82,0.2)',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? <Spinner size={14} /> : 'sign in'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--subtext)' }}>
          no account?{' '}
          <Link to="/signup" style={{ color: 'var(--text)', textDecoration: 'none' }}>
            sign up
          </Link>
        </div>
      </div>
    </div>
  )
}
