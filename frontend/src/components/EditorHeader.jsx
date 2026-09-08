import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, ChevronDown, Check, Save, SlidersHorizontal } from 'lucide-react'
import { useAuthStore } from '../store/auth.store'
import { updateDoc } from '../api/document'
import { EditDocDialog } from './EditDocDialog'
import { Spinner } from './Spinner'

const LANGUAGES = [
  { id: 'plaintext', label: 'plain text' },
  { id: 'javascript', label: 'javascript' },
  { id: 'typescript', label: 'typescript' },
  { id: 'python', label: 'python' },
  { id: 'html', label: 'html' },
  { id: 'css', label: 'css' },
  { id: 'json', label: 'json' },
  { id: 'markdown', label: 'markdown' },
  { id: 'rust', label: 'rust' },
  { id: 'go', label: 'go' },
  { id: 'cpp', label: 'c++' },
  { id: 'java', label: 'java' },
  { id: 'sql', label: 'sql' },
  { id: 'shell', label: 'shell' },
  { id: 'yaml', label: 'yaml' },
]

function LangDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const current = LANGUAGES.find((l) => l.id === value) || LANGUAGES[0]

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => setOpen((p) => !p)}
        style={{ gap: 5, minWidth: 100 }}
      >
        <span>{current.label}</span>
        <ChevronDown size={11} style={{ color: 'var(--subtext-2)' }} />
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 7,
            padding: '4px',
            minWidth: 140,
            zIndex: 50,
            maxHeight: 240,
            overflowY: 'auto',
          }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => { onChange(lang.id); setOpen(false) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '6px 10px',
                background: 'transparent',
                border: 'none',
                borderRadius: 5,
                color: value === lang.id ? 'var(--text)' : 'var(--subtext)',
                fontSize: '0.8125rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {lang.label}
              {value === lang.id && <Check size={11} style={{ color: 'var(--text)' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function PeerDots({ peers }) {
  if (!peers.length) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {peers.slice(0, 5).map((peer) => (
        <div
          key={peer.clientId}
          title={peer.user?.name || 'user'}
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: peer.user?.color || '#444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.6875rem',
            color: '#0a0a0a',
            flexShrink: 0,
            border: '2px solid var(--bg)',
            marginLeft: -6,
          }}
        >
          {(peer.user?.name?.[0] || '?').toUpperCase()}
        </div>
      ))}
      {peers.length > 5 && (
        <span style={{ fontSize: '0.75rem', color: 'var(--subtext)', marginLeft: 2 }}>
          +{peers.length - 5}
        </span>
      )}
    </div>
  )
}

export function EditorHeader({
  doc,
  docId,
  peers,
  connected,
  language,
  onLanguageChange,
  onShareOpen,
  isOwner,
  onManualSave,
  saveStatus,
  onDocUpdated,
}) {
  const navigate = useNavigate()
  const { clearAuth } = useAuthStore()
  const [showEditDialog, setShowEditDialog] = useState(false)

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          height: 52,
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          gap: 14,
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/dashboard')} title="back">
            <ArrowLeft size={16} style={{ color: 'var(--subtext)' }} />
          </button>
          <span style={{ fontSize: '0.875rem', color: 'var(--subtext-2)', userSelect: 'none' }}>ditchdocs</span>
          <span style={{ color: 'var(--border-2)', userSelect: 'none' }}>/</span>
          <span
            style={{
              fontSize: '0.9375rem',
              fontWeight: 500,
              color: 'var(--text)',
            }}
          >
            {doc?.name || 'untitled'}
          </span>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setShowEditDialog(true)}
            title="edit document name and description"
            style={{ padding: 4 }}
          >
            <SlidersHorizontal size={13} style={{ color: 'var(--subtext)' }} />
          </button>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: connected ? 'var(--success)' : 'var(--subtext-2)',
              flexShrink: 0,
            }}
            title={connected ? 'connected' : 'disconnected'}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <PeerDots peers={peers} />
          <LangDropdown value={language} onChange={onLanguageChange} />

          {onManualSave && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={onManualSave}
              disabled={saveStatus === 'saving'}
              title="Save document (Cmd+S / Ctrl+S)"
              style={{ gap: 6 }}
            >
              {saveStatus === 'saving' ? (
                <>
                  <Spinner size={13} />
                  <span>saving...</span>
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <Check size={13} style={{ color: 'var(--success)' }} />
                  <span style={{ color: 'var(--success)' }}>saved</span>
                </>
              ) : (
                <>
                  <Save size={13} style={{ color: 'var(--subtext)' }} />
                  <span>save</span>
                </>
              )}
            </button>
          )}

          {isOwner && (
            <button className="btn btn-ghost btn-sm" onClick={onShareOpen}>
              <Share2 size={13} />
              share
            </button>
          )}

          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            logout
          </button>
        </div>
      </div>

      {showEditDialog && (
        <EditDocDialog
          doc={doc}
          onSaved={(updated) => {
            onDocUpdated?.(updated)
          }}
          onClose={() => setShowEditDialog(false)}
        />
      )}
    </>
  )
}
