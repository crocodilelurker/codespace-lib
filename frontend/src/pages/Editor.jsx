import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MonacoEditor from '@monaco-editor/react'
import { useAuthStore } from '../store/auth.store'
import { updateDoc, getDocById } from '../api/document'
import { useCollabEditor } from '../hooks/useCollabEditor'
import { EditorHeader } from '../components/EditorHeader'
import { SharePanel } from '../components/SharePanel'
import { Spinner } from '../components/Spinner'

export default function Editor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, accessToken } = useAuthStore()

  const [doc, setDoc] = useState(null)
  const [docLoading, setDocLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [language, setLanguage] = useState('plaintext')
  const [showShare, setShowShare] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle')

  const editorRef = useRef(null)

  const handleRemoteLanguageChange = useCallback((newLang) => {
    if (newLang) setLanguage(newLang)
  }, [])

  const { onMount, synced, connected, peers, setDocumentLanguage, getTextContent } = useCollabEditor({
    docId: id,
    accessToken,
    user,
    onLanguageChange: handleRemoteLanguageChange,
  })

  useEffect(() => {
    if (!id) return
    setDocLoading(true)
    getDocById(id)
      .then((res) => {
        const fetchedDoc = res.data.data
        setDoc(fetchedDoc)
        if (fetchedDoc?.language) {
          setLanguage(fetchedDoc.language)
        }
      })
      .catch(() => {
        setNotFound(true)
      })
      .finally(() => {
        setDocLoading(false)
      })
  }, [id])

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang)
    setDocumentLanguage(newLang)
    if (id) {
      updateDoc(id, { language: newLang }).catch(() => {})
    }
  }

  const handleManualSave = useCallback(async () => {
    if (!id || saveStatus === 'saving') return
    setSaveStatus('saving')
    try {
      const content = getTextContent()
      await updateDoc(id, { content, language })
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch {
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 2500)
    }
  }, [id, getTextContent, language, saveStatus])

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleManualSave()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleManualSave])

  const isOwner = doc && user && (
    doc.owner === user.id ||
    doc.owner?._id === user.id ||
    doc.ownerName === user.name
  )

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor
    onMount(editor, monaco)
  }

  if (!accessToken) {
    navigate('/login')
    return null
  }

  if (docLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spinner size={22} />
      </div>
    )
  }

  if (notFound) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
        }}
      >
        <span style={{ fontSize: '0.9375rem', color: 'var(--subtext)' }}>document not found</span>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
          back to dashboard
        </button>
      </div>
    )
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      <EditorHeader
        doc={doc}
        docId={id}
        peers={peers}
        connected={connected}
        language={language}
        onLanguageChange={handleLanguageChange}
        onShareOpen={() => setShowShare(true)}
        isOwner={isOwner}
        onManualSave={handleManualSave}
        saveStatus={saveStatus}
        onDocUpdated={(updated) => setDoc((prev) => ({ ...prev, ...updated }))}
      />

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {!synced && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'var(--bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <Spinner size={20} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--subtext)' }}>syncing...</span>
          </div>
        )}
        <MonacoEditor
          height="100%"
          language={language}
          theme="vs-dark"
          onMount={handleEditorMount}
          options={{
            fontSize: 13.5,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
            fontLigatures: true,
            lineHeight: 22,
            minimap: { enabled: false },
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
            padding: { top: 16, bottom: 16 },
            renderLineHighlight: 'none',
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            cursorBlinking: 'smooth',
            cursorStyle: 'line',
            smoothScrolling: true,
            contextmenu: true,
            wordWrap: 'off',
            lineNumbers: 'on',
            glyphMargin: false,
            folding: true,
            automaticLayout: true,
          }}
        />
      </div>

      {showShare && (
        <SharePanel docId={id} onClose={() => setShowShare(false)} />
      )}
    </div>
  )
}
