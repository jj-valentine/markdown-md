import { useState, useCallback, useEffect, useRef } from 'react'
import { fileIO } from '../lib/file-io'

interface FileState {
  filePath: string | null
  fileName: string
  isDirty: boolean
  lastSaved: Date | null
}

export function useFileIO(getContent: () => string, setContent: (content: string) => void) {
  const [fileState, setFileState] = useState<FileState>({
    filePath: null,
    fileName: 'Untitled',
    isDirty: false,
    lastSaved: null
  })

  const filePathRef = useRef<string | null>(null)
  filePathRef.current = fileState.filePath

  const markDirty = useCallback(() => {
    setFileState(prev => prev.isDirty ? prev : { ...prev, isDirty: true })
  }, [])

  const open = useCallback(async () => {
    try {
      const result = await fileIO.open()
      if (!result || 'error' in result) return

      setContent(result.content)
      const name = result.filePath.split('/').pop() || result.filePath
      setFileState({
        filePath: result.filePath,
        fileName: name,
        isDirty: false,
        lastSaved: null
      })
    } catch (err) {
      console.error('[file:open]', err)
    }
  }, [setContent])

  const save = useCallback(async () => {
    try {
      const content = getContent()
      if (!content && filePathRef.current) {
        console.warn('[file:save] refusing to overwrite file with empty content')
        return
      }
      const path = filePathRef.current

      if (!path) {
        const result = await fileIO.saveAs(content)
        if (!result || 'error' in result) return
        const name = result.filePath.split('/').pop() || result.filePath
        setFileState(prev => ({
          ...prev,
          filePath: result.filePath,
          fileName: name,
          isDirty: false,
          lastSaved: new Date()
        }))
        return
      }

      const result = await fileIO.save(path, content)
      if ('error' in result) {
        console.error('[file:save]', result.error)
        return
      }
      setFileState(prev => ({ ...prev, isDirty: false, lastSaved: new Date() }))
    } catch (err) {
      console.error('[file:save]', err)
    }
  }, [getContent])

  const saveAs = useCallback(async () => {
    try {
      const content = getContent()
      const result = await fileIO.saveAs(content)
      if (!result || 'error' in result) return

      const name = result.filePath.split('/').pop() || result.filePath
      setFileState(prev => ({
        ...prev,
        filePath: result.filePath,
        fileName: name,
        isDirty: false,
        lastSaved: new Date()
      }))
    } catch (err) {
      console.error('[file:saveAs]', err)
    }
  }, [getContent])

  // Listen for native menu events (Electron)
  useEffect(() => {
    if (!window.api) return
    const cleanups = [
      window.api.onMenuOpen(open),
      window.api.onMenuSave(save),
      window.api.onMenuSaveAs(saveAs)
    ]
    return () => cleanups.forEach(fn => fn())
  }, [open, save, saveAs])

  return { ...fileState, open, save, saveAs, markDirty }
}
