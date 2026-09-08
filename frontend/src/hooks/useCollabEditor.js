import { useEffect, useRef, useState, useCallback } from 'react'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { MonacoBinding } from '../lib/monacoBinding'

const CURSOR_COLORS = [
  '#e07b54',
  '#54a8e0',
  '#5ab87a',
  '#e0c254',
  '#e05454',
  '#54d4e0',
  '#b27fe0',
  '#e08aab',
]

function colorFromId(id) {
  if (!id) return CURSOR_COLORS[0]
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i)
    hash |= 0
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length]
}

export function useCollabEditor({ docId, accessToken, user, onLanguageChange }) {
  const ydocRef = useRef(null)
  const providerRef = useRef(null)
  const bindingRef = useRef(null)
  const editorRef = useRef(null)
  const monacoRef = useRef(null)
  const [synced, setSynced] = useState(false)
  const [connected, setConnected] = useState(false)
  const [peers, setPeers] = useState([])

  const userId = user?.id || user?._id
  const userName = user?.name

  const tryBind = useCallback(() => {
    if (bindingRef.current) return
    if (!editorRef.current || !monacoRef.current || !ydocRef.current || !providerRef.current) return

    const ytext = ydocRef.current.getText('monaco')
    const binding = new MonacoBinding(
      ytext,
      editorRef.current,
      monacoRef.current,
      providerRef.current.awareness
    )
    bindingRef.current = binding
  }, [])

  const onMount = useCallback((editor, monaco) => {
    editorRef.current = editor
    if (monaco) monacoRef.current = monaco
    tryBind()
  }, [tryBind])

  const setDocumentLanguage = useCallback((lang) => {
    if (ydocRef.current) {
      const meta = ydocRef.current.getMap('meta')
      if (meta.get('language') !== lang) {
        meta.set('language', lang)
      }
    }
  }, [])

  const getTextContent = useCallback(() => {
    if (ydocRef.current) {
      return ydocRef.current.getText('monaco').toString()
    }
    if (editorRef.current) {
      return editorRef.current.getValue()
    }
    return ''
  }, [])

  useEffect(() => {
    if (!docId || !accessToken) return

    const ydoc = new Y.Doc()
    ydocRef.current = ydoc

    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'
    const provider = new WebsocketProvider(
      wsUrl,
      '',
      ydoc,
      { connect: true, disableBc: true, params: { room: docId, token: accessToken } }
    )
    providerRef.current = provider

    if (userId) {
      provider.awareness.setLocalStateField('user', {
        name: userName || 'user',
        color: colorFromId(userId),
      })
    }

    const metaMap = ydoc.getMap('meta')
    if (metaMap.get('language')) {
      onLanguageChange?.(metaMap.get('language'))
    }
    const onMetaChange = () => {
      const lang = metaMap.get('language')
      if (lang) {
        onLanguageChange?.(lang)
      }
    }
    metaMap.observe(onMetaChange)

    const updateCursorStyles = () => {
      let css = ''
      provider.awareness.getStates().forEach((state, clientId) => {
        if (clientId === provider.awareness.clientID || !state.user) return
        const name = (state.user.name || 'user').replace(/'/g, "\\'")
        const color = state.user.color || '#54a8e0'
        css += `
          .yRemoteSelection-${clientId} {
            background-color: ${color}33 !important;
          }
          .yRemoteSelectionHead-${clientId} {
            position: absolute;
            border-left: 2px solid ${color} !important;
            border-top: 2px solid ${color} !important;
            border-bottom: 2px solid ${color} !important;
            height: 100%;
            box-sizing: border-box;
          }
          .yRemoteSelectionHead-${clientId}::after {
            position: absolute;
            content: '${name}';
            top: -19px;
            left: -2px;
            font-size: 10.5px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-weight: 500;
            color: #ffffff;
            background-color: ${color};
            padding: 1px 6px;
            border-radius: 3px;
            white-space: nowrap;
            pointer-events: none;
            line-height: 14px;
            z-index: 50;
          }
        `
      })

      let styleEl = document.getElementById('y-monaco-cursor-styles')
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = 'y-monaco-cursor-styles'
        document.head.appendChild(styleEl)
      }
      styleEl.innerHTML = css
    }

    const handleSync = (isSynced) => {
      const state = Boolean(isSynced)
      setSynced(state)
      if (state) {
        tryBind()
        bindingRef.current?.syncValue?.()
        const initialLang = metaMap.get('language')
        if (initialLang) onLanguageChange?.(initialLang)
      }
    }

    provider.on('sync', handleSync)
    provider.on('synced', handleSync)
    if (provider.synced) {
      handleSync(true)
    }

    const syncPoll = setInterval(() => {
      if (provider.synced) {
        setSynced(true)
        tryBind()
        bindingRef.current?.syncValue?.()
      }
    }, 250)

    provider.on('status', ({ status }) => {
      setConnected(status === 'connected')
    })

    provider.awareness.on('change', () => {
      const states = Array.from(provider.awareness.getStates().entries())
        .filter(([clientId]) => clientId !== provider.awareness.clientID)
        .map(([clientId, state]) => ({ clientId, user: state.user }))
        .filter((p) => p.user)
      setPeers(states)
      updateCursorStyles()
    })

    tryBind()

    return () => {
      clearInterval(syncPoll)
      metaMap.unobserve(onMetaChange)
      if (bindingRef.current) {
        bindingRef.current.destroy()
        bindingRef.current = null
      }
      provider.disconnect()
      provider.destroy()
      ydoc.destroy()
      ydocRef.current = null
      providerRef.current = null
      setSynced(false)
      setConnected(false)
      setPeers([])
      const styleEl = document.getElementById('y-monaco-cursor-styles')
      if (styleEl) styleEl.innerHTML = ''
    }
  }, [docId, accessToken, userId, userName, tryBind, onLanguageChange])

  return { onMount, synced, connected, peers, setDocumentLanguage, getTextContent }
}
