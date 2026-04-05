interface FileResult {
  filePath: string
  content: string
}

interface SaveResult {
  filePath: string
}

interface IpcError {
  error: string
}

interface ElectronApi {
  openFile: () => Promise<FileResult | IpcError | null>
  saveFile: (filePath: string, content: string) => Promise<SaveResult | IpcError>
  saveFileAs: (content: string) => Promise<SaveResult | IpcError | null>
  onMenuOpen: (callback: () => void) => () => void
  onMenuSave: (callback: () => void) => () => void
  onMenuSaveAs: (callback: () => void) => () => void
  onFormatBold: (callback: () => void) => () => void
  onFormatItalic: (callback: () => void) => () => void
  onFormatStrike: (callback: () => void) => () => void
  onFormatCode: (callback: () => void) => () => void
  onFormatHighlight: (callback: () => void) => () => void
  onPromoteHeading: (callback: () => void) => () => void
  onDemoteHeading: (callback: () => void) => () => void
  onSetHeading: (callback: (level: number) => void) => () => void
  onFormatBulletList: (callback: () => void) => () => void
  onFormatOrderedList: (callback: () => void) => () => void
  onFormatTaskList: (callback: () => void) => () => void
  onFormatLink: (callback: () => void) => () => void
  onFormatBlockquote: (callback: () => void) => () => void
  onFormatInsertTable: (callback: () => void) => () => void
  onFormatInsertImage: (callback: () => void) => () => void
  onFormatCodeBlock: (callback: () => void) => () => void
  onQueryDirty: (callback: () => void) => () => void
  replyDirty: (isDirty: boolean) => void
  notifySaveComplete: () => void
  notifySaveFailed: (error: string) => void
}

declare global {
  interface Window {
    api?: ElectronApi
  }
}

export {}
