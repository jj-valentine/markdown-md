import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from '@tiptap/markdown'
import { forwardRef, useImperativeHandle, useCallback, useEffect, useState, useRef } from 'react'
import type { Level } from '@tiptap/extension-heading'

export interface TiptapEditorHandle {
  getMarkdown: () => string
  setMarkdown: (content: string) => void
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

    const editor = useEditor({
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: 'Start writing...'
        }),
        Markdown.configure({
          html: false,
          transformPastedText: true,
          transformCopiedText: true
        })
      ],
      content: '',
      onUpdate: () => onUpdate?.(),
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
      const parsed = (editor as any).markdown.parse(content)
      editor.commands.setContent(parsed)
      // Clear undo history so Ctrl+Z doesn't revert past the file load
      editor.commands.clearHistory()
    }, [editor])

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

    useImperativeHandle(ref, () => ({ getMarkdown, setMarkdown }), [getMarkdown, setMarkdown])

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
