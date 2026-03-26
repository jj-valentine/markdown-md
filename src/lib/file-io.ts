const isElectron = () => typeof window !== 'undefined' && !!window.api

// --- Electron backend ---

async function electronOpen(): Promise<{ filePath: string; content: string } | null> {
  return window.api!.openFile()
}

async function electronSave(filePath: string, content: string): Promise<{ filePath: string }> {
  return window.api!.saveFile(filePath, content)
}

async function electronSaveAs(content: string): Promise<{ filePath: string } | null> {
  return window.api!.saveFileAs(content)
}

// --- Web backend (all browsers) ---

function webOpen(): Promise<{ filePath: string; content: string } | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown,.mdx,.txt'
    input.addEventListener('cancel', () => resolve(null))
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return resolve(null)
      const reader = new FileReader()
      reader.onload = () => resolve({ filePath: file.name, content: reader.result as string })
      reader.onerror = () => resolve(null)
      reader.readAsText(file)
    }
    input.click()
  })
}

function webSave(_filePath: string, content: string): Promise<{ filePath: string }> {
  return webSaveAs(content) as Promise<{ filePath: string }>
}

function webSaveAs(content: string): Promise<{ filePath: string }> {
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'document.md'
  a.click()
  URL.revokeObjectURL(url)
  return Promise.resolve({ filePath: 'document.md' })
}

// --- Unified adapter ---

export const fileIO = {
  open: () => isElectron() ? electronOpen() : webOpen(),
  save: (filePath: string, content: string) => isElectron() ? electronSave(filePath, content) : webSave(filePath, content),
  saveAs: (content: string) => isElectron() ? electronSaveAs(content) : webSaveAs(content),
  isElectron
}
