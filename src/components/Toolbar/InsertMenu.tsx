import { useState, useRef, useEffect } from 'react'
import { Plus, Table, Minus, Code, Image } from 'lucide-react'
import type { Editor } from '@tiptap/react'

interface InsertMenuProps {
  editor: Editor
}

export default function InsertMenu({ editor }: InsertMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const insert = (action: () => void) => {
    action()
    setOpen(false)
  }

  return (
    <div className="insert-menu" ref={ref}>
      <button
        className="toolbar-btn"
        title="Insert"
        onMouseDown={(e) => {
          e.preventDefault()
          setOpen(!open)
        }}
      >
        <Plus size={18} strokeWidth={1.5} />
      </button>
      {open && (
        <div className="insert-menu-dropdown">
          <button
            className="insert-menu-item"
            onMouseDown={(e) => {
              e.preventDefault()
              insert(() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())
            }}
          >
            <Table size={16} strokeWidth={1.5} />
            <span>Table</span>
          </button>
          <button
            className="insert-menu-item"
            onMouseDown={(e) => {
              e.preventDefault()
              insert(() => editor.chain().focus().setHorizontalRule().run())
            }}
          >
            <Minus size={16} strokeWidth={1.5} />
            <span>Horizontal Rule</span>
          </button>
          <button
            className="insert-menu-item"
            onMouseDown={(e) => {
              e.preventDefault()
              insert(() => editor.chain().focus().setCodeBlock().run())
            }}
          >
            <Code size={16} strokeWidth={1.5} />
            <span>Code Block</span>
          </button>
          <button
            className="insert-menu-item"
            onMouseDown={(e) => {
              e.preventDefault()
              insert(() => {
                const url = window.prompt('Image URL:')
                if (url) editor.chain().focus().setImage({ src: url }).run()
              })
            }}
          >
            <Image size={16} strokeWidth={1.5} />
            <span>Image</span>
          </button>
        </div>
      )}
    </div>
  )
}
