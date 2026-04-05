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
    backgroundColor: '#343434',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: true
    }
  })

  // Lock zoom to 1x — prevent all zoom changes
  win.webContents.setZoomLevel(0)
  win.webContents.setVisualZoomLevelLimits(1, 1)

  // Intercept keys that macOS or Chromium would swallow before reaching ProseMirror.
  // Uses input.code (physical key) not input.key (composed character — unreliable with modifiers).
  // IPC sent via setImmediate so Chromium finishes processing the preventDefault first.
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return

    const cmd = input.meta || input.control

    // Cmd+=/- : block zoom, send promote/demote
    // Cmd+Shift+=/- : block zoom (no action — Shift variants reserved for lists below)
    if (cmd && (input.code === 'Equal' || input.code === 'Minus')) {
      event.preventDefault()
      win.webContents.setZoomLevel(0)
      if (!input.shift) {
        setImmediate(() => {
          win.webContents.send(input.code === 'Equal' ? 'format:promote-heading' : 'format:demote-heading')
        })
      } else {
        // Cmd+Shift+- → bullet list, Cmd+Shift+= → ordered list
        setImmediate(() => {
          win.webContents.send(input.code === 'Minus' ? 'format:bullet-list' : 'format:ordered-list')
        })
      }
      return
    }

    // Cmd+Shift+0 → task list
    if (cmd && input.shift && input.code === 'Digit0') {
      event.preventDefault()
      setImmediate(() => win.webContents.send('format:task-list'))
      return
    }

    // Alt+Shift+1-6 → headings (macOS produces special chars, so ProseMirror can't catch these)
    if (input.alt && input.shift && !cmd) {
      const digitMatch = input.code.match(/^Digit([1-6])$/)
      if (digitMatch) {
        event.preventDefault()
        setImmediate(() => win.webContents.send('format:set-heading', Number(digitMatch[1])))
        return
      }
      if (input.code === 'KeyP') {
        event.preventDefault()
        setImmediate(() => win.webContents.send('format:set-heading', 0))
        return
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
        { label: 'Bold', accelerator: 'CmdOrCtrl+B', click: (_item, win) => win?.webContents.send('format:bold') },
        { label: 'Italic', accelerator: 'CmdOrCtrl+I', click: (_item, win) => win?.webContents.send('format:italic') },
        { label: 'Strikethrough', accelerator: 'CmdOrCtrl+Shift+X', click: (_item, win) => win?.webContents.send('format:strike') },
        { label: 'Code', accelerator: 'CmdOrCtrl+Shift+`', click: (_item, win) => win?.webContents.send('format:code') },
        { label: 'Highlight', accelerator: 'CmdOrCtrl+Shift+C', click: (_item, win) => win?.webContents.send('format:highlight') },
        { type: 'separator' },
        // registerAccelerator:false — macOS eats Alt+Shift+Number before Electron sees them.
        // before-input-event handles these via input.code. Menu items are display-only.
        { label: 'Paragraph', accelerator: 'Alt+Shift+P', registerAccelerator: false, click: (_item, win) => win?.webContents.send('format:set-heading', 0) },
        { label: 'Heading 1', accelerator: 'Alt+Shift+1', registerAccelerator: false, click: (_item, win) => win?.webContents.send('format:set-heading', 1) },
        { label: 'Heading 2', accelerator: 'Alt+Shift+2', registerAccelerator: false, click: (_item, win) => win?.webContents.send('format:set-heading', 2) },
        { label: 'Heading 3', accelerator: 'Alt+Shift+3', registerAccelerator: false, click: (_item, win) => win?.webContents.send('format:set-heading', 3) },
        { label: 'Heading 4', accelerator: 'Alt+Shift+4', registerAccelerator: false, click: (_item, win) => win?.webContents.send('format:set-heading', 4) },
        { label: 'Heading 5', accelerator: 'Alt+Shift+5', registerAccelerator: false, click: (_item, win) => win?.webContents.send('format:set-heading', 5) },
        { label: 'Heading 6', accelerator: 'Alt+Shift+6', registerAccelerator: false, click: (_item, win) => win?.webContents.send('format:set-heading', 6) },
        { type: 'separator' },
        // registerAccelerator:false — before-input-event handles these to block Chromium zoom
        { label: 'Promote Heading', accelerator: 'CmdOrCtrl+=', registerAccelerator: false, click: (_item, win) => win?.webContents.send('format:promote-heading') },
        { label: 'Demote Heading', accelerator: 'CmdOrCtrl+-', registerAccelerator: false, click: (_item, win) => win?.webContents.send('format:demote-heading') },
        { type: 'separator' },
        // registerAccelerator:false — before-input-event handles these (Shift changes input.key)
        { label: 'Bullet List', accelerator: 'CmdOrCtrl+Shift+-', registerAccelerator: false, click: (_item, win) => win?.webContents.send('format:bullet-list') },
        { label: 'Ordered List', accelerator: 'CmdOrCtrl+Shift+=', registerAccelerator: false, click: (_item, win) => win?.webContents.send('format:ordered-list') },
        { label: 'Task List', accelerator: 'CmdOrCtrl+Shift+0', registerAccelerator: false, click: (_item, win) => win?.webContents.send('format:task-list') },
        { type: 'separator' },
        // registerAccelerator:false — FormatShortcuts in renderer handles these; menu items are display-only
        { label: 'Blockquote', accelerator: 'CmdOrCtrl+Shift+B', registerAccelerator: false, click: (_item, win) => win?.webContents.send('format:blockquote') },
        { label: 'Link', accelerator: 'CmdOrCtrl+K', registerAccelerator: false, click: (_item, win) => win?.webContents.send('format:link') },
        { type: 'separator' },
        { label: 'Insert Table', accelerator: 'CmdOrCtrl+Shift+T', registerAccelerator: false, click: (_item, win) => win?.webContents.send('format:insert-table') },
        { label: 'Insert Image', accelerator: 'CmdOrCtrl+Shift+I', registerAccelerator: false, click: (_item, win) => win?.webContents.send('format:insert-image') },
        { label: 'Code Block', accelerator: 'CmdOrCtrl+Shift+E', registerAccelerator: false, click: (_item, win) => win?.webContents.send('format:code-block') },
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
  // zoom: true disables the optimizer's zoom-key blocking — we handle that ourselves
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window, { zoom: true })
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
