import { useEffect, useState, useCallback } from 'react'
import { Plus, Minus, Trash2 } from 'lucide-react'
import type { Editor } from '@tiptap/react'

interface TableControlsProps {
  editor: Editor
}

interface Position {
  top: number
  left: number
  width: number
}

const ICON = 14
const STROKE = 1.5

export default function TableControls({ editor }: TableControlsProps) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState<Position>({ top: 0, left: 0, width: 0 })

  const updatePosition = useCallback(() => {
    try {
      if (!editor.isActive('table')) {
        setVisible(false)
        return
      }

      // Find the table DOM element from the current selection
      const { $from } = editor.state.selection
      let depth = $from.depth
      while (depth > 0) {
        const node = $from.node(depth)
        if (node.type.name === 'table') break
        depth--
      }
      if (depth === 0) {
        setVisible(false)
        return
      }

      const tablePos = $from.before(depth)
      const dom = editor.view.nodeDOM(tablePos)
      if (!dom || !(dom instanceof HTMLElement)) {
        setVisible(false)
        return
      }

      const rect = dom.getBoundingClientRect()
      const editorRect = editor.view.dom.closest('.main-content')?.getBoundingClientRect()
      if (!editorRect) {
        setVisible(false)
        return
      }

      setPos({
        top: rect.bottom - editorRect.top + 4,
        left: rect.left - editorRect.left,
        width: rect.width,
      })
      setVisible(true)
    } catch {
      setVisible(false)
    }
  }, [editor])

  useEffect(() => {
    editor.on('selectionUpdate', updatePosition)
    editor.on('update', updatePosition)
    return () => {
      editor.off('selectionUpdate', updatePosition)
      editor.off('update', updatePosition)
    }
  }, [editor, updatePosition])

  if (!visible) return null

  const btn = (title: string, onClick: () => void, icon: typeof Plus, danger?: boolean) => (
    <button
      className={`table-control-btn${danger ? ' table-control-danger' : ''}`}
      title={title}
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
    >
      {icon({ size: ICON, strokeWidth: STROKE })}
    </button>
  )

  return (
    <div
      className="table-controls"
      style={{ top: pos.top, left: pos.left, width: pos.width }}
    >
      {btn('Add column before', () => editor.chain().focus().addColumnBefore().run(), Plus)}
      {btn('Add column after', () => editor.chain().focus().addColumnAfter().run(), Plus)}
      <div className="table-controls-divider" />
      {btn('Add row before', () => editor.chain().focus().addRowBefore().run(), Plus)}
      {btn('Add row after', () => editor.chain().focus().addRowAfter().run(), Plus)}
      <div className="table-controls-divider" />
      {btn('Delete column', () => editor.chain().focus().deleteColumn().run(), Minus)}
      {btn('Delete row', () => editor.chain().focus().deleteRow().run(), Minus)}
      <div className="table-controls-divider" />
      {btn('Delete table', () => editor.chain().focus().deleteTable().run(), Trash2, true)}
    </div>
  )
}
