interface FileResult {
  filePath: string
  content: string
}

interface SaveResult {
  filePath: string
}

interface ElectronApi {
  openFile: () => Promise<FileResult | null>
  saveFile: (filePath: string, content: string) => Promise<SaveResult>
  saveFileAs: (content: string) => Promise<SaveResult | null>
  onMenuOpen: (callback: () => void) => () => void
  onMenuSave: (callback: () => void) => () => void
  onMenuSaveAs: (callback: () => void) => () => void
  onPromoteHeading: (callback: () => void) => () => void
  onDemoteHeading: (callback: () => void) => () => void
}

declare global {
  interface Window {
    api?: ElectronApi
  }
}

export {}
