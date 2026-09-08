import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LogOut } from 'lucide-react'
import { getMyDocs } from '../api/document'
import { useAuthStore } from '../store/auth.store'
import { DocCard } from '../components/DocCard'
import { CreateDocDialog } from '../components/CreateDocDialog'
import { EditDocDialog } from '../components/EditDocDialog'
import { Spinner } from '../components/Spinner'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, clearAuth } = useAuthStore()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editingDoc, setEditingDoc] = useState(null)
  const [tab, setTab] = useState('all')

  const userId = user?.id || user?._id

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMyDocs()
      setDocs(res.data.data || [])
    } catch {
      setDocs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const handleCreated = (doc) => {
    setShowCreate(false)
    navigate(`/editor/${doc._id}`)
  }

  const handleDeleted = (id) => {
    setDocs((prev) => prev.filter((d) => d._id !== id))
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  const { ownedDocs, sharedDocs, visibleDocs } = useMemo(() => {
    const owned = docs.filter((d) => {
      return (
        d.owner === userId ||
        d.owner?._id === userId ||
        d.ownerName === user?.name
      )
    })
    const shared = docs.filter((d) => {
      return !(
        d.owner === userId ||
        d.owner?._id === userId ||
        d.ownerName === user?.name
      )
    })
    const visible = tab === 'owned' ? owned : tab === 'shared' ? shared : docs
    return { ownedDocs: owned, sharedDocs: shared, visibleDocs: visible }
  }, [docs, userId, user?.name, tab])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 36px',
          height: 58,
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--text)', letterSpacing: '-0.01em' }}>ditchdocs</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {userId && (
            <div
              title="Your User ID (select to copy)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                fontSize: '0.8125rem',
                padding: '5px 12px',
                borderRadius: 6,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                userSelect: 'all',
                cursor: 'text',
              }}
            >
              <span style={{ color: 'var(--subtext-2)', fontSize: '0.75rem' }}>id:</span>
              <span
                style={{
                  color: 'var(--text)',
                  fontFamily: 'monospace',
                  userSelect: 'all',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                }}
              >
                {userId}
              </span>
            </div>
          )}
          {user?.name && (
            <span style={{ fontSize: '0.9375rem', color: 'var(--subtext)' }}>{user.name}</span>
          )}
          <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="logout">
            <LogOut size={16} style={{ color: 'var(--subtext)' }} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '36px 36px', width: '100%' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setTab('all')}
              className={`btn btn-sm ${tab === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.8125rem', padding: '5px 12px' }}
            >
              all ({docs.length})
            </button>
            <button
              onClick={() => setTab('owned')}
              className={`btn btn-sm ${tab === 'owned' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.8125rem', padding: '5px 12px' }}
            >
              owned by me ({ownedDocs.length})
            </button>
            <button
              onClick={() => setTab('shared')}
              className={`btn btn-sm ${tab === 'shared' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.8125rem', padding: '5px 12px' }}
            >
              shared with me ({sharedDocs.length})
            </button>
          </div>

          <button
            className="btn btn-primary"
            style={{ fontSize: '0.875rem', padding: '7px 14px', gap: 6 }}
            onClick={() => setShowCreate(true)}
            id="create-doc-btn"
          >
            <Plus size={15} />
            new document
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
            <Spinner size={22} />
          </div>
        ) : visibleDocs.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              padding: '96px 0',
            }}
          >
            <span style={{ fontSize: '0.95rem', color: 'var(--subtext-2)' }}>
              {tab === 'shared' ? 'no shared documents yet' : tab === 'owned' ? 'no documents created yet' : 'no documents yet'}
            </span>
            {tab !== 'shared' && (
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCreate(true)} style={{ fontSize: '0.875rem' }}>
                <Plus size={14} />
                create one
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {visibleDocs.map((doc) => (
              <DocCard
                key={doc._id}
                doc={doc}
                currentUser={user}
                onDeleted={handleDeleted}
                onEdit={(d) => setEditingDoc(d)}
              />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateDocDialog onCreated={handleCreated} onClose={() => setShowCreate(false)} />
      )}

      {editingDoc && (
        <EditDocDialog
          doc={editingDoc}
          onSaved={(updated) => {
            setDocs((prev) => prev.map((d) => (d._id === updated._id ? { ...d, ...updated } : d)))
          }}
          onClose={() => setEditingDoc(null)}
        />
      )}
    </div>
  )
}
