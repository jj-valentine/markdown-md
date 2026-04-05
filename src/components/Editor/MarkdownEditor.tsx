import { useRef, useCallback, useEffect, useState, type RefObject } from 'react'
import TiptapEditor, { type TiptapEditorHandle } from './TiptapEditor'
import TableControls from './TableControls'
import { useFileIO } from '../../hooks/useFileIO'
import { useEditorStore } from '../../stores/editor-store'
import { scheduleAutosave, getAutosave, clearAutosave } from '../../lib/autosave'

interface MarkdownEditorProps {
  onEditorReady?: (handle: TiptapEditorHandle) => void
}

export default function MarkdownEditor({ onEditorReady }: MarkdownEditorProps) {
  const editorRef = useRef<TiptapEditorHandle>(null)
  const store = useEditorStore()

  const getContent = useCallback(() => {
    return editorRef.current?.getMarkdown() ?? ''
  }, [])

  const setContent = useCallback((content: string) => {
    editorRef.current?.setMarkdown(content)
  }, [])

  const file = useFileIO(getContent, setContent)

  // Sync file state to Zustand store
  useEffect(() => {
    if (file.filePath) {
      store.setFile(file.filePath, file.fileName)
    }
  }, [file.filePath, file.fileName])

  useEffect(() => {
    store.setDirty(file.isDirty)
  }, [file.isDirty])

  useEffect(() => {
    if (file.lastSaved) store.setSaved()
  }, [file.lastSaved])

  // Restore from autosave — deferred until editor ref is available
  const [editorReady, setEditorReady] = useState(false)
  useEffect(() => {
    if (editorReady) return
    // Poll briefly for the editor ref (Tiptap inits async)
    const id = setInterval(() => {
      if (editorRef.current) {
        clearInterval(id)
        setEditorReady(true)
        const saved = getAutosave()
        if (saved) {
          editorRef.current.setMarkdown(saved.content)
          store.setDirty(true)
        }
      }
    }, 50)
    return () => clearInterval(id)
  }, [editorReady])

  // Notify parent when editor is ready
  useEffect(() => {
    if (editorReady && editorRef.current && onEditorReady) {
      onEditorReady(editorRef.current)
    }
  }, [editorReady, onEditorReady])

  // Clear autosave when a file is explicitly opened (prevents stale restore on relaunch)
  useEffect(() => {
    if (file.filePath) clearAutosave()
  }, [file.filePath])

  // Clear autosave on explicit save
  useEffect(() => {
    if (file.lastSaved) clearAutosave()
  }, [file.lastSaved])

  const handleUpdate = useCallback(() => {
    file.markDirty()

    // Update word count + autosave — wrapped in try-catch because getMarkdown()
    // can throw if the document contains nodes the serializer can't handle mid-transaction
    try {
      const text = editorRef.current?.getMarkdown() ?? ''
      const words = text.trim().split(/\s+/).filter(Boolean).length
      store.setWordCount(words)
      scheduleAutosave(text, file.fileName, file.filePath)
    } catch (err) {
      console.warn('[handleUpdate] getMarkdown failed:', err)
    }
  }, [file.markDirty, file.fileName, file.filePath, store.setWordCount])

  // Scrollbar fade: show on scroll/hover, hide after 1.2s idle
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showScrollbar = useCallback(() => {
    scrollRef.current?.classList.add('scrollbar-visible')
    if (scrollTimer.current) clearTimeout(scrollTimer.current)
    scrollTimer.current = setTimeout(() => {
      scrollRef.current?.classList.remove('scrollbar-visible')
    }, 1200)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', showScrollbar, { passive: true })
    el.addEventListener('mouseenter', showScrollbar)
    return () => {
      el.removeEventListener('scroll', showScrollbar)
      el.removeEventListener('mouseenter', showScrollbar)
    }
  }, [showScrollbar])

  return (
    <div className="main-content" ref={scrollRef}>
      <TiptapEditor ref={editorRef} onUpdate={handleUpdate} />
      {editorReady && editorRef.current?.editor && (
        <TableControls editor={editorRef.current.editor} />
      )}
    </div>
  )
}
