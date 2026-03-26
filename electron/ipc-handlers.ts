import { ipcMain, dialog, BrowserWindow } from 'electron'
import { readFile, writeFile } from 'fs/promises'

// Tracks file paths opened or saved-as via OS dialog — only these are
// trusted for subsequent file:save calls from the renderer.
const allowedPaths = new Set<string>()

export function registerFileHandlers(): void {
  ipcMain.handle('file:open', async (_event) => {
    try {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) return null

      const result = await dialog.showOpenDialog(win, {
        properties: ['openFile'],
        filters: [
          { name: 'Markdown', extensions: ['md', 'markdown', 'mdx'] },
          { name: 'Text', extensions: ['txt'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      if (result.canceled || result.filePaths.length === 0) return null

      const filePath = result.filePaths[0]
      const content = await readFile(filePath, 'utf-8')
      allowedPaths.add(filePath)
      return { filePath, content }
    } catch (err) {
      console.error('[file:open]', err)
      return { error: (err as Error).message }
    }
  })

  ipcMain.handle('file:save', async (_event, filePath: string, content: string) => {
    try {
      if (!allowedPaths.has(filePath)) {
        return { error: 'File path not authorized. Open or Save As first.' }
      }
      await writeFile(filePath, content, 'utf-8')
      return { filePath }
    } catch (err) {
      console.error('[file:save]', err)
      return { error: (err as Error).message }
    }
  })

  ipcMain.handle('file:save-as', async (_event, content: string) => {
    try {
      const win = BrowserWindow.getFocusedWindow()
      if (!win) return null

      const result = await dialog.showSaveDialog(win, {
        filters: [
          { name: 'Markdown', extensions: ['md'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        defaultPath: 'untitled.md'
      })

      if (result.canceled || !result.filePath) return null

      await writeFile(result.filePath, content, 'utf-8')
      allowedPaths.add(result.filePath)
      return { filePath: result.filePath }
    } catch (err) {
      console.error('[file:save-as]', err)
      return { error: (err as Error).message }
    }
  })
}
