import { useState } from 'react'
import { createDoc } from '../api/document'
import { Spinner } from './Spinner'

export function CreateDocDialog({ onCreated, onClose }) {
  const [name, setName] = useState('')
  const [publicAccess, setPublicAccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('name is required')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await createDoc(name.trim(), publicAccess)
      onCreated(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'failed to create document')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        backdropFilter: 'blur(2px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '24px',
          width: '100%',
          maxWidth: 380,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ fontSize: '0.9375rem', color: 'var(--text)' }}>new document</div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="field">
            <label className="label" htmlFor="doc-name">name</label>
            <input
              id="doc-name"
              className={`input${error ? ' error' : ''}`}
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              placeholder="untitled"
              autoFocus
              autoComplete="off"
            />
            {error && <span className="error-text">{error}</span>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="checkbox"
              id="public-access"
              checked={publicAccess}
              onChange={(e) => setPublicAccess(e.target.checked)}
              style={{ accentColor: 'var(--text)', width: 14, height: 14 }}
            />
            <label htmlFor="public-access" style={{ fontSize: '0.875rem', color: 'var(--subtext)', cursor: 'pointer' }}>
              public access
            </label>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              {loading ? <Spinner size={14} /> : 'create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
