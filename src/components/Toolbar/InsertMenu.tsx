import { useState, useRef, useEffect } from 'react'
import { Plus, Table, Minus, SquareCode, Image } from 'lucide-react'
import type { Editor } from '@tiptap/react'
import ToolbarButton from './ToolbarButton'
import UrlInput from './UrlInput'

interface InsertMenuProps {
  editor: Editor
  expanded?: boolean
}

export default function InsertMenu({ editor, expanded }: InsertMenuProps) {
  const [open, setOpen] = useState(false)
  const [imageInputOpen, setImageInputOpen] = useState(false)
  const [tablePickerOpen, setTablePickerOpen] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)
  const ref = useRef<HTMLDivElement>(null)
  const savedSelectionRef = useRef<{ from: number; to: number } | null>(null)

  const saveSelection = () => {
    const { from, to } = editor.state.selection
    savedSelectionRef.current = { from, to }
  }

  const restoreFocusAndRun = (fn: () => boolean) => {
    const sel = savedSelectionRef.current
    if (sel) {
      editor.chain().focus().setTextSelection(sel).run()
    } else {
      editor.chain().focus().run()
    }
    fn()
    savedSelectionRef.current = null
  }

  useEffect(() => {
    if (!open && !imageInputOpen && !tablePickerOpen) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        requestAnimationFrame(() => {
          setOpen(false)
          setImageInputOpen(false)
          setTablePickerOpen(false)
        })
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, imageInputOpen, tablePickerOpen])

  useEffect(() => {
    const handler = () => {
      saveSelection()
      setImageInputOpen(true)
    }
    window.addEventListener('toolbar:open-image-input', handler)
    return () => window.removeEventListener('toolbar:open-image-input', handler)
  }, [editor])

  const closeAll = () => {
    setOpen(false)
    setImageInputOpen(false)
    setTablePickerOpen(false)
    savedSelectionRef.current = null
  }

  const insertTable = () => {
    restoreFocusAndRun(() =>
      editor.chain().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true }).run()
    )
    closeAll()
  }

  const tablePicker = tablePickerOpen && (
    <div className="insert-menu-dropdown">
      <div className="table-size-picker">
        <span className="table-size-picker-label">Table size</span>
        <div className="table-size-picker-row">
          <label>Rows</label>
          <input
            className="table-size-picker-input"
            type="number"
            min={1}
            max={20}
            value={tableRows}
            onChange={(e) => setTableRows(Math.max(1, Math.min(20, Number(e.target.value))))}
            onKeyDown={(e) => { if (e.key === 'Enter') insertTable() }}
          />
        </div>
        <div className="table-size-picker-row">
          <label>Cols</label>
          <input
            className="table-size-picker-input"
            type="number"
            min={1}
            max={20}
            value={tableCols}
            onChange={(e) => setTableCols(Math.max(1, Math.min(20, Number(e.target.value))))}
            onKeyDown={(e) => { if (e.key === 'Enter') insertTable() }}
          />
        </div>
        <button
          className="table-size-picker-insert"
          onMouseDown={(e) => {
            e.preventDefault()
            insertTable()
          }}
        >
          Insert Table
        </button>
      </div>
    </div>
  )

  const imageInput = imageInputOpen && (
    <UrlInput
      label="Image URL"
      onSubmit={(url) => {
        restoreFocusAndRun(() =>
          editor.chain().setImage({ src: url }).run()
        )
        closeAll()
      }}
      onCancel={closeAll}
    />
  )

  // Expanded mode: render as inline toolbar buttons
  if (expanded) {
    return (
      <div className="insert-menu insert-menu-expanded" ref={ref}>
        <div className="toolbar-group insert-expanded-group">
          <div style={{ position: 'relative' }}>
            <ToolbarButton
              icon={Table}
              label="Table"
              shortcut="⌘⇧T"
              onClick={() => {
                saveSelection()
                const wasOpen = tablePickerOpen
                closeAll()
                if (!wasOpen) setTablePickerOpen(true)
              }}
            />
            {tablePicker}
          </div>
          <ToolbarButton
            icon={Minus}
            label="Horizontal Rule"
            onClick={() => {
              editor.chain().focus().setHorizontalRule().run()
            }}
          />
          <ToolbarButton
            icon={SquareCode}
            label="Code Block"
            shortcut="⌘⇧E"
            onClick={() => {
              editor.chain().focus().setCodeBlock().run()
            }}
          />
          <div style={{ position: 'relative' }}>
            <ToolbarButton
              icon={Image}
              label="Image"
              shortcut="⌘⇧I"
              onClick={() => {
                saveSelection()
                const wasOpen = imageInputOpen
                closeAll()
                if (!wasOpen) setImageInputOpen(true)
              }}
            />
            {imageInput}
          </div>
        </div>
      </div>
    )
  }

  // Collapsed mode: "+" dropdown
  return (
    <div className="insert-menu" ref={ref}>
      <button
        className="toolbar-btn"
        title="Insert"
        onMouseDown={(e) => {
          e.preventDefault()
          const wasOpen = open || imageInputOpen || tablePickerOpen
          closeAll()
          if (!wasOpen) setOpen(true)
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
              saveSelection()
              setOpen(false)
              setTablePickerOpen(true)
            }}
          >
            <Table size={16} strokeWidth={1.5} />
            <span>Table</span>
            <span className="insert-menu-shortcut">⌘⇧T</span>
          </button>
          <button
            className="insert-menu-item"
            onMouseDown={(e) => {
              e.preventDefault()
              editor.chain().focus().setHorizontalRule().run()
              closeAll()
            }}
          >
            <Minus size={16} strokeWidth={1.5} />
            <span>Horizontal Rule</span>
          </button>
          <button
            className="insert-menu-item"
            onMouseDown={(e) => {
              e.preventDefault()
              editor.chain().focus().setCodeBlock().run()
              closeAll()
            }}
          >
            <SquareCode size={16} strokeWidth={1.5} />
            <span>Code Block</span>
            <span className="insert-menu-shortcut">⌘⇧E</span>
          </button>
          <button
            className="insert-menu-item"
            onMouseDown={(e) => {
              e.preventDefault()
              saveSelection()
              setOpen(false)
              setImageInputOpen(true)
            }}
          >
            <Image size={16} strokeWidth={1.5} />
            <span>Image</span>
            <span className="insert-menu-shortcut">⌘⇧I</span>
          </button>
        </div>
      )}
      {tablePicker}
      {imageInput}
    </div>
  )
}
