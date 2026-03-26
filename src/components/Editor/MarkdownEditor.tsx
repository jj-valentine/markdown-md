import { useRef, useCallback, useEffect, useState } from 'react'
import TiptapEditor, { type TiptapEditorHandle } from './TiptapEditor'
import { useFileIO } from '../../hooks/useFileIO'
import { useEditorStore } from '../../stores/editor-store'
import { scheduleAutosave, getAutosave, clearAutosave } from '../../lib/autosave'

export default function MarkdownEditor() {
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
  const [restored, setRestored] = useState(false)
  useEffect(() => {
    if (restored || !editorRef.current) return
    const saved = getAutosave()
    if (saved) {
      setContent(saved.content)
      store.setDirty(true)
    }
    setRestored(true)
  })

  // Clear autosave on explicit save
  useEffect(() => {
    if (file.lastSaved) clearAutosave()
  }, [file.lastSaved])

  const handleUpdate = useCallback(() => {
    file.markDirty()

    // Update word count
    const text = editorRef.current?.getMarkdown() ?? ''
    const words = text.trim().split(/\s+/).filter(Boolean).length
    store.setWordCount(words)

    // Schedule autosave
    scheduleAutosave(text, file.fileName, file.filePath)
  }, [file.markDirty, file.fileName, file.filePath, store.setWordCount])

  return (
    <div className="main-content">
      <TiptapEditor ref={editorRef} onUpdate={handleUpdate} />
    </div>
  )
}
