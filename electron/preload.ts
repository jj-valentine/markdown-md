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

  // Format events
  onPromoteHeading: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('format:promote-heading', handler)
    return () => { ipcRenderer.removeListener('format:promote-heading', handler) }
  },
  onDemoteHeading: (callback: () => void) => {
    const handler = () => callback()
    ipcRenderer.on('format:demote-heading', handler)
    return () => { ipcRenderer.removeListener('format:demote-heading', handler) }
  }
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
