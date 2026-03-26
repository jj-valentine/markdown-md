const AUTOSAVE_KEY = 'markdown-md:autosave'
const AUTOSAVE_META_KEY = 'markdown-md:autosave-meta'

interface AutosaveMeta {
  fileName: string
  filePath: string | null
  savedAt: string
}

let timer: ReturnType<typeof setTimeout> | null = null

export function scheduleAutosave(content: string, fileName: string, filePath: string | null): void {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    localStorage.setItem(AUTOSAVE_KEY, content)
    localStorage.setItem(AUTOSAVE_META_KEY, JSON.stringify({
      fileName,
      filePath,
      savedAt: new Date().toISOString()
    }))
  }, 1000)
}

export function getAutosave(): { content: string; meta: AutosaveMeta } | null {
  const content = localStorage.getItem(AUTOSAVE_KEY)
  const metaStr = localStorage.getItem(AUTOSAVE_META_KEY)
  if (!content || !metaStr) return null

  try {
    const meta = JSON.parse(metaStr) as AutosaveMeta
    return { content, meta }
  } catch {
    return null
  }
}

export function clearAutosave(): void {
  localStorage.removeItem(AUTOSAVE_KEY)
  localStorage.removeItem(AUTOSAVE_META_KEY)
  if (timer) clearTimeout(timer)
}
