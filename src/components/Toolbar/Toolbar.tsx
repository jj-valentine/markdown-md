import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Link,
  Highlighter,
  Undo2,
  Redo2
} from 'lucide-react'
import { useEditorState } from '@tiptap/react'
import type { Editor } from '@tiptap/react'
import ToolbarButton from './ToolbarButton'
import HeadingDropdown from './HeadingDropdown'
import InsertMenu from './InsertMenu'
import UrlInput from './UrlInput'

interface ToolbarProps {
  editor: Editor | null
}

export default function Toolbar({ editor }: ToolbarProps) {
  // Subscribe to editor state changes so toolbar buttons reflect cursor position
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      if (!ctx.editor) return null
      const e = ctx.editor
      return {
        bold: e.isActive('bold'),
        italic: e.isActive('italic'),
        strike: e.isActive('strike'),
        code: e.isActive('code'),
        highlight: e.isActive('highlight'),
        bulletList: e.isActive('bulletList'),
        orderedList: e.isActive('orderedList'),
        taskList: e.isActive('taskList'),
        blockquote: e.isActive('blockquote'),
        link: e.isActive('link'),
        canUndo: e.can().undo(),
        canRedo: e.can().redo(),
      }
    },
  })

  const [linkInputOpen, setLinkInputOpen] = useState(false)
  const [linkEditUrl, setLinkEditUrl] = useState('')
  const [linkDisplayText, setLinkDisplayText] = useState('')

  // Listen for IPC events that need to open toolbar UI
  const openLinkInput = useCallback(() => {
    if (!editor) return
    if (editor.isActive('link')) {
      const href = editor.getAttributes('link').href || ''
      setLinkEditUrl(href)
      // Get the link's display text from the selection or mark range
      const { from, to } = editor.state.selection
      const text = editor.state.doc.textBetween(from, to, '')
      setLinkDisplayText(text)
      setLinkInputOpen(true)
    } else {
      setLinkEditUrl('')
      // Pre-fill display text from selection
      const { from, to, empty } = editor.state.selection
      setLinkDisplayText(empty ? '' : editor.state.doc.textBetween(from, to, ''))
      setLinkInputOpen(true)
    }
  }, [editor])

  // Listen for link open from both IPC (menu) and CustomEvent (FormatShortcuts ⌘K)
  useEffect(() => {
    const handler = () => openLinkInput()
    window.addEventListener('toolbar:open-link-input', handler)
    return () => window.removeEventListener('toolbar:open-link-input', handler)
  }, [openLinkInput])

  useEffect(() => {
    if (!window.api || !editor) return
    const cleanups = [
      window.api.onFormatLink(openLinkInput),
      window.api.onFormatInsertTable(() => {
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
      }),
      window.api.onFormatInsertImage(() => {
        window.dispatchEvent(new CustomEvent('toolbar:open-image-input'))
      }),
    ]
    return () => cleanups.forEach(fn => fn())
  }, [editor, openLinkInput])

  // Responsive: expand insert menu items when toolbar is wide enough
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [expandInsert, setExpandInsert] = useState(false)

  useEffect(() => {
    const el = toolbarRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setExpandInsert(entry.contentRect.width > 700)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Select word at cursor before applying inline formatting (standard text editor behavior)
  const formatInline = useCallback((toggle: (chain: ReturnType<Editor['chain']>) => ReturnType<Editor['chain']>) => {
    if (!editor) return
    const { empty, from } = editor.state.selection
    let chain = editor.chain().focus()
    if (empty) {
      const $pos = editor.state.doc.resolve(from)
      const text = $pos.parent.textContent
      const offset = $pos.parentOffset
      let start = offset, end = offset
      while (start > 0 && /\w/.test(text[start - 1])) start--
      while (end < text.length && /\w/.test(text[end])) end++
      if (start !== end) {
        chain = chain.setTextSelection({ from: $pos.start() + start, to: $pos.start() + end })
      }
    }
    toggle(chain).run()
  }, [editor])

  if (!editor || !editorState) return null

  return (
    <div className="toolbar" ref={toolbarRef}>
      <div className="toolbar-inner">
        {/* Undo / Redo */}
        <div className="toolbar-group">
          <ToolbarButton
            icon={Undo2}
            label="Undo"
            shortcut="⌘Z"
            disabled={!editorState.canUndo}
            onClick={() => editor.chain().focus().undo().run()}
          />
          <ToolbarButton
            icon={Redo2}
            label="Redo"
            shortcut="⌘⇧Z"
            disabled={!editorState.canRedo}
            onClick={() => editor.chain().focus().redo().run()}
          />
        </div>

        <div className="toolbar-divider" />

        {/* Block type */}
        <div className="toolbar-group">
          <HeadingDropdown editor={editor} />
        </div>

        <div className="toolbar-divider" />

        {/* Inline formatting */}
        <div className="toolbar-group">
          <ToolbarButton
            icon={Bold}
            label="Bold"
            shortcut="⌘B"
            isActive={editorState.bold}
            onClick={() => formatInline(c => c.toggleBold())}
          />
          <ToolbarButton
            icon={Italic}
            label="Italic"
            shortcut="⌘I"
            isActive={editorState.italic}
            onClick={() => formatInline(c => c.toggleItalic())}
          />
          <ToolbarButton
            icon={Strikethrough}
            label="Strikethrough"
            shortcut="⌘⇧X"
            isActive={editorState.strike}
            onClick={() => formatInline(c => c.toggleStrike())}
          />
          <ToolbarButton
            icon={Code}
            label="Inline Code"
            shortcut="⌘⇧`"
            isActive={editorState.code}
            onClick={() => formatInline(c => c.toggleCode())}
          />
          <ToolbarButton
            icon={Highlighter}
            label="Highlight"
            shortcut="⌘⇧C"
            isActive={editorState.highlight}
            onClick={() => formatInline(c => c.toggleHighlight())}
          />
        </div>

        <div className="toolbar-divider" />

        {/* Lists & blocks */}
        <div className="toolbar-group">
          <ToolbarButton
            icon={List}
            label="Bullet List"
            shortcut="⌘⇧-"
            isActive={editorState.bulletList}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            icon={ListOrdered}
            label="Ordered List"
            shortcut="⌘⇧+"
            isActive={editorState.orderedList}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarButton
            icon={ListTodo}
            label="Task List"
            shortcut="⌘⇧0"
            isActive={editorState.taskList}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          />
          <ToolbarButton
            icon={Quote}
            label="Blockquote"
            shortcut="⌘⇧B"
            isActive={editorState.blockquote}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          />
        </div>

        <div className="toolbar-divider" />

        {/* Link */}
        <div className="toolbar-group" style={{ position: 'relative' }}>
          <ToolbarButton
            icon={Link}
            label="Link"
            shortcut="⌘K"
            isActive={editorState.link}
            onClick={openLinkInput}
          />
          {linkInputOpen && (
            <UrlInput
              label="URL"
              initialValue={linkEditUrl}
              initialDisplayText={linkDisplayText}
              showDisplayText
              showRemove={editor.isActive('link')}
              onSubmit={(url, displayText) => {
                const { from, to, empty } = editor.state.selection
                if (empty && displayText) {
                  // No selection — insert display text as a link
                  editor.chain().focus()
                    .insertContent(`<a href="${url}">${displayText}</a>`)
                    .run()
                } else if (displayText && displayText !== editor.state.doc.textBetween(from, to, '')) {
                  // Selection exists but display text was changed — replace text + set link
                  editor.chain().focus()
                    .deleteSelection()
                    .insertContent(`<a href="${url}">${displayText}</a>`)
                    .run()
                } else {
                  // Selection exists, display text unchanged — just set the link
                  editor.chain().focus().setLink({ href: url }).run()
                }
                setLinkInputOpen(false)
              }}
              onRemove={() => {
                editor.chain().focus().unsetLink().run()
                setLinkInputOpen(false)
              }}
              onCancel={() => setLinkInputOpen(false)}
            />
          )}
        </div>

        <div className="toolbar-divider" />

        {/* Insert */}
        <div className="toolbar-group">
          <InsertMenu editor={editor} expanded={expandInsert} />
        </div>
      </div>
    </div>
  )
}
