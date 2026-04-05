import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  // File operations via IPC
  openFile: () => ipcRenderer.invoke('file:open') as Promise<{ filePath: string; content: string } | null>,
  saveFile: (filePath: string, content: string) => ipcRenderer.invoke('file:save', filePath, content) as Promise<{ filePath: string }>,
  saveFileAs: (content: string) => ipcRenderer.invoke('file:save-as', content) as Promise<{ filePath: string } | null>,

  // Menu events from main process
  onMenuOpen: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('menu:open', handler)
    return () => { ipcRenderer.removeListener('menu:open', handler) }
  },
  onMenuSave: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('menu:save', handler)
    return () => { ipcRenderer.removeListener('menu:save', handler) }
  },
  onMenuSaveAs: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('menu:save-as', handler)
    return () => { ipcRenderer.removeListener('menu:save-as', handler) }
  },

  // Format events — inline marks
  onFormatBold: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('format:bold', handler)
    return () => { ipcRenderer.removeListener('format:bold', handler) }
  },
  onFormatItalic: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('format:italic', handler)
    return () => { ipcRenderer.removeListener('format:italic', handler) }
  },
  onFormatStrike: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('format:strike', handler)
    return () => { ipcRenderer.removeListener('format:strike', handler) }
  },
  onFormatCode: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('format:code', handler)
    return () => { ipcRenderer.removeListener('format:code', handler) }
  },
  onFormatHighlight: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('format:highlight', handler)
    return () => { ipcRenderer.removeListener('format:highlight', handler) }
  },

  // Format events — headings
  onPromoteHeading: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('format:promote-heading', handler)
    return () => { ipcRenderer.removeListener('format:promote-heading', handler) }
  },
  onDemoteHeading: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('format:demote-heading', handler)
    return () => { ipcRenderer.removeListener('format:demote-heading', handler) }
  },
  onSetHeading: (callback: (level: number) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, level: number) => callback(level)
    ipcRenderer.on('format:set-heading', handler)
    return () => { ipcRenderer.removeListener('format:set-heading', handler) }
  },

  // Format events — lists
  onFormatBulletList: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('format:bullet-list', handler)
    return () => { ipcRenderer.removeListener('format:bullet-list', handler) }
  },
  onFormatOrderedList: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('format:ordered-list', handler)
    return () => { ipcRenderer.removeListener('format:ordered-list', handler) }
  },
  onFormatTaskList: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('format:task-list', handler)
    return () => { ipcRenderer.removeListener('format:task-list', handler) }
  },

  // Format events — link
  onFormatLink: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('format:link', handler)
    return () => { ipcRenderer.removeListener('format:link', handler) }
  },

  // Format events — blockquote
  onFormatBlockquote: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('format:blockquote', handler)
    return () => { ipcRenderer.removeListener('format:blockquote', handler) }
  },

  // Format events — insert (table, image, code block)
  onFormatInsertTable: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('format:insert-table', handler)
    return () => { ipcRenderer.removeListener('format:insert-table', handler) }
  },
  onFormatInsertImage: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('format:insert-image', handler)
    return () => { ipcRenderer.removeListener('format:insert-image', handler) }
  },
  onFormatCodeBlock: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('format:code-block', handler)
    return () => { ipcRenderer.removeListener('format:code-block', handler) }
  },

  // Close guard — main asks if dirty, renderer replies
  onQueryDirty: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('query:is-dirty', handler)
    return () => { ipcRenderer.removeListener('query:is-dirty', handler) }
  },
  replyDirty: (isDirty: boolean) => ipcRenderer.send('reply:is-dirty', isDirty),
  notifySaveComplete: () => ipcRenderer.send('save-complete'),
  notifySaveFailed: (error: string) => ipcRenderer.send('save-failed', error)
}

export type Api = typeof api

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
} else {
  // @ts-expect-error fallback for non-isolated context
  window.electron = electronAPI
  // @ts-expect-error fallback
  window.api = api
}
