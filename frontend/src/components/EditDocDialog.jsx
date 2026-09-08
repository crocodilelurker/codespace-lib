import { useState } from 'react'
import { updateDoc } from '../api/document'
import { Spinner } from './Spinner'
import { X } from 'lucide-react'

export function EditDocDialog({ doc, onSaved, onClose }) {
  const docId = doc?._id || doc?.id
  const [name, setName] = useState(doc?.name || '')
  const [description, setDescription] = useState(doc?.description || '')
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
      const res = await updateDoc(docId, {
        name: name.trim(),
        description: description.trim(),
      })
      onSaved?.(res.data.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'failed to update document')
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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '24px',
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text)' }}>
            edit document details
          </span>
          <button className="btn btn-icon btn-ghost" onClick={onClose} title="close">
            <X size={15} style={{ color: 'var(--subtext)' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label className="label" htmlFor="doc-name">
              name
            </label>
            <input
              id="doc-name"
              className={`input${error ? ' error' : ''}`}
              placeholder="document name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              autoFocus
            />
            {error && <span className="error-text">{error}</span>}
          </div>

          <div className="field">
            <label className="label" htmlFor="doc-desc">
              description
            </label>
            <textarea
              id="doc-desc"
              className="input"
              placeholder="optional description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ resize: 'vertical', minHeight: 70 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
              disabled={loading}
            >
              cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading}
              style={{ minWidth: 64 }}
            >
              {loading ? <Spinner size={13} /> : 'save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
