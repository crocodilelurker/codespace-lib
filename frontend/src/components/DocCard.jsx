import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, FileText, Users, Globe, Lock, SlidersHorizontal } from 'lucide-react'
import { deleteDoc } from '../api/document'

export function DocCard({ doc, currentUser, onDeleted, onEdit }) {
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)

  const userId = currentUser?.id || currentUser?._id
  const isOwner = userId && (
    doc.owner === userId ||
    doc.owner?._id === userId ||
    doc.ownerName === currentUser?.name
  )

  let myRole = isOwner ? 'owner' : 'viewer'
  if (!isOwner && doc.accessMap?.collaborators) {
    const col = doc.accessMap.collaborators.find((c) => {
      const cId = c.userid?._id ? c.userid._id.toString() : c.userid?.toString()
      return cId === userId?.toString()
    })
    if (col?.role) myRole = col.role
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!window.confirm('delete this document?')) return
    setDeleting(true)
    try {
      await deleteDoc(doc._id)
      onDeleted(doc._id)
    } catch {
      setDeleting(false)
    }
  }

  const handleEditClick = (e) => {
    e.stopPropagation()
    onEdit?.(doc)
  }

  const updatedAt = new Date(doc.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div
      onClick={() => navigate(`/editor/${doc._id}`)}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '20px',
        cursor: 'pointer',
        transition: 'border-color 0.15s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'relative',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-2)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <FileText size={16} style={{ color: 'var(--subtext)', flexShrink: 0 }} />
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 500,
              color: 'var(--text)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {doc.name || 'untitled'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button
            className="btn-icon btn-ghost btn"
            onClick={handleEditClick}
            title="edit details"
            style={{ padding: 4 }}
          >
            <SlidersHorizontal size={13} style={{ color: 'var(--subtext)' }} />
          </button>
          {isOwner && (
            <button
              className="btn-icon btn-ghost btn"
              onClick={handleDelete}
              disabled={deleting}
              title="delete"
              style={{ padding: 4, opacity: deleting ? 0.4 : undefined }}
            >
              <Trash2 size={13} style={{ color: 'var(--subtext)' }} />
            </button>
          )}
        </div>
      </div>

      {doc.description ? (
        <div
          style={{
            fontSize: '0.8125rem',
            color: 'var(--subtext)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.4',
          }}
        >
          {doc.description}
        </div>
      ) : null}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className={`tag ${isOwner ? 'tag-owner' : myRole === 'editor' ? 'tag-editor' : 'tag-viewer'}`}>
            {myRole}
          </span>
          {doc.accessMap?.publicAccess ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--subtext)' }}>
              <Globe size={11} />
              public
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--subtext)' }}>
              <Lock size={11} />
              private
            </span>
          )}
          {doc.accessMap?.collaborators?.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--subtext)' }}>
              <Users size={11} />
              {doc.accessMap.collaborators.length}
            </span>
          )}
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--subtext-2)' }}>
          {updatedAt}
        </div>
      </div>
    </div>
  )
}
