import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerFileHandlers } from './ipc-handlers'

// Track close-guard state across windows
const pendingDirtyQuery = new Set<number>()
const pendingClose = new Set<number>()

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: '#0e0e0e',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: true
    }
  })

  // Intercept Cmd+=/- to block zoom and forward as heading shortcuts
  win.webContents.setVisualZoomLevelLimits(1, 1)
  win.webContents.on('before-input-event', (event, input) => {
    if ((input.meta || input.control) && input.type === 'keyDown') {
      if (input.key === '=' || input.key === '+') {
        event.preventDefault()
        win.webContents.send('format:promote-heading')
      } else if (input.key === '-') {
        event.preventDefault()
        win.webContents.send('format:demote-heading')
      }
    }
  })

  // Prompt before closing with unsaved changes
  // Second close attempt while renderer is unresponsive forces close
  win.on('close', (e) => {
    if (pendingDirtyQuery.has(win.id)) {
      pendingDirtyQuery.delete(win.id)
      return
    }
    e.preventDefault()
    pendingDirtyQuery.add(win.id)
    win.webContents.send('query:is-dirty')
  })

  // Open external links in browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return win
}

function buildMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: (_item, win) => win?.webContents.send('menu:open')
        },
        {
          label: 'Save',
          accelerator: 'CmdOrCtrl+S',
          click: (_item, win) => win?.webContents.send('menu:save')
        },
        {
          label: 'Save As...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: (_item, win) => win?.webContents.send('menu:save-as')
        },
        { type: 'separator' },
        { role: 'close' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'Format',
      submenu: [
        { label: 'Promote Heading          ⌘=', enabled: true, click: (_item, win) => win?.webContents.send('format:promote-heading') },
        { label: 'Demote Heading           ⌘-', enabled: true, click: (_item, win) => win?.webContents.send('format:demote-heading') }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.markdown-md')

  // Default open or close DevTools by F12 in dev, ignore in prod
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerFileHandlers()

  // Handle dirty-state response from renderer for close guard
  ipcMain.on('reply:is-dirty', (event: Electron.IpcMainEvent, isDirty: boolean) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    pendingDirtyQuery.delete(win.id)

    if (!isDirty) {
      win.destroy()
      return
    }

    const choice = dialog.showMessageBoxSync(win, {
      type: 'question',
      buttons: ['Save', "Don't Save", 'Cancel'],
      defaultId: 0,
      cancelId: 2,
      message: 'You have unsaved changes.',
      detail: 'Do you want to save before closing?'
    })

    if (choice === 0) {
      // Tell renderer to save — it will send 'save-complete' when done
      pendingClose.add(win.id)
      win.webContents.send('menu:save')
    } else if (choice === 1) {
      win.destroy()
    }
    // choice === 2 (Cancel): do nothing, keep window open
  })

  ipcMain.on('save-complete', (event: Electron.IpcMainEvent) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win && pendingClose.has(win.id)) {
      pendingClose.delete(win.id)
      win.destroy()
    }
  })

  ipcMain.on('save-failed', (event: Electron.IpcMainEvent, error: string) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) return
    pendingClose.delete(win.id)
    dialog.showMessageBoxSync(win, {
      type: 'error',
      buttons: ['OK'],
      message: 'Save failed',
      detail: error || 'The file could not be saved.'
    })
  })

  buildMenu()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
