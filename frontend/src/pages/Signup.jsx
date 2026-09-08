import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../api/auth'
import { useAuthStore } from '../store/auth.store'
import { Spinner } from '../components/Spinner'

export default function Signup() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', phoneNumber: '', password: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n })
    setApiError('')
  }

  const validate = () => {
    const e = {}
    if (form.name.trim().length < 3) e.name = 'minimum 3 characters'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'invalid email'
    if (form.phoneNumber.trim().length < 10) e.phoneNumber = 'minimum 10 digits'
    if (form.password.length < 6) e.password = 'minimum 6 characters'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    setLoading(true)
    try {
      const res = await signup(form.name, form.email, form.phoneNumber, form.password)
      const { id, name, email, accessToken, refreshToken } = res.data.data
      setAuth({ id, name, email }, accessToken, refreshToken)
      navigate('/dashboard')
    } catch (err) {
      setApiError(err.response?.data?.message || 'signup failed')
      setLoading(false)
    }
  }

  const field = (id, label, type, placeholder, key) => (
    <div className="field">
      <label className="label" htmlFor={id}>{label}</label>
      <input
        id={id}
        className={`input${errors[key] ? ' error' : ''}`}
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={set(key)}
        autoComplete={key === 'password' ? 'new-password' : key}
      />
      {errors[key] && <span className="error-text">{errors[key]}</span>}
    </div>
  )

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
          <span style={{ fontSize: '0.875rem', color: 'var(--subtext)' }}>create an account</span>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {field('signup-name', 'name', 'text', 'your name', 'name')}
          {field('signup-email', 'email', 'email', 'you@example.com', 'email')}
          {field('signup-phone', 'phone number', 'tel', '0000000000', 'phoneNumber')}
          {field('signup-password', 'password', 'password', '••••••••', 'password')}

          {apiError && (
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
              {apiError}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? <Spinner size={14} /> : 'create account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--subtext)' }}>
          have an account?{' '}
          <Link to="/login" style={{ color: 'var(--text)', textDecoration: 'none' }}>
            sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
