import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from '@tiptap/markdown'
import { EditorState } from '@tiptap/pm/state'
import { forwardRef, useImperativeHandle, useCallback, useEffect, useState, useRef } from 'react'
import type { Level } from '@tiptap/extension-heading'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Typography from '@tiptap/extension-typography'
import { common, createLowlight } from 'lowlight'

const lowlight = createLowlight(common)

export interface TiptapEditorHandle {
  getMarkdown: () => string
  setMarkdown: (content: string) => void
  editor: ReturnType<typeof useEditor>
}

interface TiptapEditorProps {
  onUpdate?: () => void
}

interface BadgeState {
  label: string
  x: number
  y: number
  visible: boolean
}

function getCurrentLevel(editor: any): number {
  const { $from } = editor.state.selection
  const node = $from.parent
  if (node.type.name === 'heading') return node.attrs.level
  return 0
}

const TiptapEditor = forwardRef<TiptapEditorHandle, TiptapEditorProps>(
  function TiptapEditor({ onUpdate }, ref) {
    const [badge, setBadge] = useState<BadgeState>({ label: '', x: 0, y: 0, visible: false })
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const onUpdateRef = useRef(onUpdate)
    onUpdateRef.current = onUpdate

    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          codeBlock: false, // replaced by CodeBlockLowlight
        }),
        Placeholder.configure({
          placeholder: 'Start writing...'
        }),
        Markdown.configure({
          html: false,
          transformPastedText: true,
          transformCopiedText: true
        }),
        Highlight,
        TaskList,
        TaskItem.configure({ nested: true }),
        Table.configure({ resizable: false }),
        TableRow,
        TableCell,
        TableHeader,
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' }
        }),
        Image,
        CodeBlockLowlight.configure({ lowlight }),
        Typography,
      ],
      content: '',
      onUpdate: () => onUpdateRef.current?.(),
      editorProps: {
        attributes: {
          class: 'tiptap'
        }
      }
    })

    const showBadge = useCallback((label: string) => {
      if (!editor) return

      // Find the current block node's DOM element to get its full bounding rect
      const { from } = editor.state.selection
      const resolved = editor.state.doc.resolve(from)
      const blockPos = resolved.before(1)
      const domNode = editor.view.nodeDOM(blockPos) as HTMLElement | null

      let x: number
      let y: number

      if (domNode) {
        const rect = domNode.getBoundingClientRect()
        // Position in left margin, vertically centered with the block
        x = rect.left - 48
        y = rect.top + rect.height / 2 - 10
      } else {
        const coords = editor.view.coordsAtPos(from)
        x = coords.left - 48
        y = coords.top
      }

      // Clear any pending hide
      if (hideTimer.current) clearTimeout(hideTimer.current)

      setBadge({ label, x, y, visible: true })

      hideTimer.current = setTimeout(() => {
        setBadge(prev => ({ ...prev, visible: false }))
      }, 600)
    }, [editor])

    const getMarkdown = useCallback(() => {
      if (!editor) return ''
      return (editor as any).getMarkdown() as string
    }, [editor])

    const setMarkdown = useCallback((content: string) => {
      if (!editor) return
      try {
        // Parse markdown to JSON, then create a fresh ProseMirror state.
        // This avoids setContent's doc-in-doc nesting bug (corrupts heading attrs)
        // and gives us a clean undo history — the loaded file becomes the baseline.
        const json = (editor as any).markdown.parse(content)
        const doc = editor.schema.nodeFromJSON(json)
        const newState = EditorState.create({
          doc,
          schema: editor.schema,
          plugins: editor.view.state.plugins,
        })
        editor.view.updateState(newState)
      } catch (err) {
        console.error('[setMarkdown] failed to parse content, falling back to plain text:', err)
        editor.commands.setContent(`<p>${content}</p>`)
      }
    }, [editor])

    // Semantic order: H1 > H2 > H3 > H4 > H5 > H6 > P
    // Promote = move up (P→H6, H6→H5, ..., H1 stays)
    // Demote  = move down (H1→H2, ..., H6→P, P stays)
    const promoteHeading = useCallback(() => {
      if (!editor) return
      const current = getCurrentLevel(editor)
      if (current === 1) {
        showBadge('H1')
        return
      }
      if (current === 0) {
        editor.chain().focus().setHeading({ level: 6 as Level }).run()
        showBadge('H6')
      } else {
        const newLevel = (current - 1) as Level
        editor.chain().focus().setHeading({ level: newLevel }).run()
        showBadge(`H${newLevel}`)
      }
    }, [editor, showBadge])

    const demoteHeading = useCallback(() => {
      if (!editor) return
      const current = getCurrentLevel(editor)
      if (current === 0) {
        showBadge('P')
        return
      }
      if (current === 6) {
        editor.chain().focus().setParagraph().run()
        showBadge('P')
      } else {
        const newLevel = (current + 1) as Level
        editor.chain().focus().setHeading({ level: newLevel }).run()
        showBadge(`H${newLevel}`)
      }
    }, [editor, showBadge])

    useEffect(() => {
      if (!window.api) return
      const cleanups = [
        window.api.onPromoteHeading(promoteHeading),
        window.api.onDemoteHeading(demoteHeading)
      ]
      return () => cleanups.forEach(fn => fn())
    }, [promoteHeading, demoteHeading])

    useImperativeHandle(ref, () => ({ getMarkdown, setMarkdown, editor }), [getMarkdown, setMarkdown, editor])

    return (
      <div className="editor-wrapper">
        <EditorContent editor={editor} />
        <div
          className={`heading-badge ${badge.visible ? 'heading-badge-visible' : ''}`}
          style={{ left: badge.x, top: badge.y }}
        >
          {badge.label}
        </div>
      </div>
    )
  }
)

export default TiptapEditor
