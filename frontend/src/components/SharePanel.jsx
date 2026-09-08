import { useState, useEffect, useCallback } from 'react'
import { X, UserPlus, Trash2, ChevronDown, Link, Check, UserCheck } from 'lucide-react'
import { getAccessMap, addCollaborator, removeCollaborator, updateCollaborator } from '../api/access'
import { getUserById } from '../api/auth'
import { Spinner } from './Spinner'
import { copyToClipboard } from '../lib/utils'

function RoleSelect({ value, onChange, disabled }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          appearance: 'none',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 5,
          color: 'var(--subtext)',
          fontSize: '0.75rem',
          padding: '4px 22px 4px 8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
        }}
      >
        <option value="viewer">viewer</option>
        <option value="editor">editor</option>
      </select>
      <ChevronDown
        size={10}
        style={{
          position: 'absolute',
          right: 6,
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--subtext-2)',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}

export function SharePanel({ docId, onClose }) {
  const [accessMap, setAccessMap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [addUserId, setAddUserId] = useState('')
  const [addRole, setAddRole] = useState('viewer')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [actionLoading, setActionLoading] = useState({})
  const [copiedLink, setCopiedLink] = useState(false)
  const [confirmUser, setConfirmUser] = useState(null)

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/editor/${docId}`
    const ok = await copyToClipboard(url)
    if (ok) {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAccessMap(docId)
      setAccessMap(res.data.data)
    } catch {
      setAccessMap(null)
    } finally {
      setLoading(false)
    }
  }, [docId])

  useEffect(() => { load() }, [load])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!addUserId.trim()) { setAddError('user id is required'); return }
    setAdding(true)
    setAddError('')
    try {
      const userRes = await getUserById(addUserId.trim())
      const found = userRes.data.data
      setConfirmUser({ id: found.id, name: found.name, role: addRole })
    } catch (err) {
      setAddError(err.response?.data?.message || 'user not found with this id')
    } finally {
      setAdding(false)
    }
  }

  const handleConfirmAdd = async () => {
    if (!confirmUser) return
    setAdding(true)
    setAddError('')
    try {
      await addCollaborator(docId, confirmUser.id, confirmUser.role)
      setConfirmUser(null)
      setAddUserId('')
      setAddRole('viewer')
      await load()
    } catch (err) {
      setAddError(err.response?.data?.message || 'failed to add collaborator')
    } finally {
      setAdding(false)
    }
  }

  const handleRemove = async (userid) => {
    setActionLoading((prev) => ({ ...prev, [userid]: 'removing' }))
    try {
      await removeCollaborator(docId, userid)
      await load()
    } catch {
    } finally {
      setActionLoading((prev) => { const n = { ...prev }; delete n[userid]; return n })
    }
  }

  const handleRoleChange = async (userid, role) => {
    setActionLoading((prev) => ({ ...prev, [userid]: 'updating' }))
    try {
      await updateCollaborator(docId, userid, role)
      await load()
    } catch {
    } finally {
      setActionLoading((prev) => { const n = { ...prev }; delete n[userid]; return n })
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
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
          maxWidth: 440,
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.9375rem', color: 'var(--text)' }}>sharing</span>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>
            <X size={14} style={{ color: 'var(--subtext)' }} />
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
            <Spinner size={18} />
          </div>
        ) : !accessMap ? (
          <div style={{ color: 'var(--subtext)', fontSize: '0.875rem' }}>could not load access data</div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--subtext)' }}>visibility</span>
                  <span className={`tag ${accessMap.publicAccess ? 'tag-editor' : ''}`}>
                    {accessMap.publicAccess ? 'public' : 'private'}
                  </span>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleCopyLink}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}
                >
                  {copiedLink ? <Check size={12} style={{ color: 'var(--accent)' }} /> : <Link size={12} />}
                  <span>{copiedLink ? 'link copied' : 'copy link'}</span>
                </button>
              </div>
              {accessMap.publicAccess && (
                <span style={{ fontSize: '0.75rem', color: 'var(--subtext-2)' }}>
                  Anyone with this link can view this document in read-only mode.
                </span>
              )}
            </div>

            <div className="divider" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--subtext)' }}>collaborators</span>
              {accessMap.collaborators?.length === 0 && (
                <div style={{ fontSize: '0.8125rem', color: 'var(--subtext-2)' }}>none yet</div>
              )}
              {accessMap.collaborators?.map((col) => {
                const uid = col.userid?._id || col.userid
                const name = col.userid?.name || uid
                const isOwner = col.role === 'owner'
                const loading = actionLoading[uid]
                return (
                  <div
                    key={uid}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 10,
                      padding: '8px 10px',
                      background: 'var(--surface-2)',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {loading ? (
                        <Spinner size={13} />
                      ) : isOwner ? (
                        <span className="tag tag-owner">owner</span>
                      ) : (
                        <>
                          <RoleSelect
                            value={col.role}
                            onChange={(role) => handleRoleChange(uid, role)}
                            disabled={!!loading}
                          />
                          <button
                            className="btn btn-icon btn-ghost"
                            onClick={() => handleRemove(uid)}
                            title="remove"
                          >
                            <Trash2 size={12} style={{ color: 'var(--subtext)' }} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="divider" />

            {confirmUser ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  padding: '12px 14px',
                  background: 'var(--surface-2)',
                  borderRadius: 8,
                  border: '1px solid var(--border-2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserCheck size={16} style={{ color: 'var(--accent)' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text)', fontWeight: 500 }}>
                    Add {confirmUser.name}?
                  </span>
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--subtext)' }}>
                  This user will be added as a <span className="tag">{confirmUser.role}</span>.
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setConfirmUser(null)}
                    disabled={adding}
                  >
                    cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleConfirmAdd}
                    disabled={adding}
                  >
                    {adding ? <Spinner size={13} /> : 'confirm add'}
                  </button>
                </div>
                {addError && <span className="error-text">{addError}</span>}
              </div>
            ) : (
              <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--subtext)' }}>add collaborator</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    className={`input${addError ? ' error' : ''}`}
                    placeholder="user id"
                    value={addUserId}
                    onChange={(e) => { setAddUserId(e.target.value); setAddError('') }}
                    autoComplete="off"
                  />
                  <RoleSelect value={addRole} onChange={setAddRole} />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={adding} style={{ flexShrink: 0 }}>
                    {adding ? <Spinner size={13} /> : <UserPlus size={13} />}
                  </button>
                </div>
                {addError && <span className="error-text">{addError}</span>}
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}
