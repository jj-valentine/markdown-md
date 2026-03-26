import { create } from 'zustand'

interface EditorState {
  fileName: string
  filePath: string | null
  isDirty: boolean
  lastSaved: Date | null
  wordCount: number

  setFile: (filePath: string, fileName: string) => void
  setDirty: (dirty: boolean) => void
  setSaved: () => void
  setWordCount: (count: number) => void
  reset: () => void
}

export const useEditorStore = create<EditorState>((set) => ({
  fileName: 'Untitled',
  filePath: null,
  isDirty: false,
  lastSaved: null,
  wordCount: 0,

  setFile: (filePath, fileName) => set({ filePath, fileName, isDirty: false }),
  setDirty: (dirty) => set({ isDirty: dirty }),
  setSaved: () => set({ isDirty: false, lastSaved: new Date() }),
  setWordCount: (count) => set({ wordCount: count }),
  reset: () => set({ fileName: 'Untitled', filePath: null, isDirty: false, lastSaved: null, wordCount: 0 })
}))
