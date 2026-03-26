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
import type { Editor } from '@tiptap/react'
import ToolbarButton from './ToolbarButton'
import HeadingDropdown from './HeadingDropdown'
import InsertMenu from './InsertMenu'

interface ToolbarProps {
  editor: Editor | null
}

export default function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return null

  return (
    <div className="toolbar">
      {/* Undo / Redo */}
      <div className="toolbar-group">
        <ToolbarButton
          icon={Undo2}
          label="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          icon={Redo2}
          label="Redo"
          disabled={!editor.can().redo()}
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
          isActive={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={Italic}
          label="Italic"
          isActive={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon={Strikethrough}
          label="Strikethrough"
          isActive={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
        <ToolbarButton
          icon={Code}
          label="Inline Code"
          isActive={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        />
        <ToolbarButton
          icon={Highlighter}
          label="Highlight"
          isActive={editor.isActive('highlight')}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        />
      </div>

      <div className="toolbar-divider" />

      {/* Lists & blocks */}
      <div className="toolbar-group">
        <ToolbarButton
          icon={List}
          label="Bullet List"
          isActive={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={ListOrdered}
          label="Ordered List"
          isActive={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          icon={ListTodo}
          label="Task List"
          isActive={editor.isActive('taskList')}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
        />
        <ToolbarButton
          icon={Quote}
          label="Blockquote"
          isActive={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
      </div>

      <div className="toolbar-divider" />

      {/* Link */}
      <div className="toolbar-group">
        <ToolbarButton
          icon={Link}
          label="Link"
          isActive={editor.isActive('link')}
          onClick={() => {
            if (editor.isActive('link')) {
              editor.chain().focus().unsetLink().run()
              return
            }
            const url = window.prompt('URL:')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          }}
        />
      </div>

      <div className="toolbar-divider" />

      {/* Insert */}
      <div className="toolbar-group">
        <InsertMenu editor={editor} />
      </div>
    </div>
  )
}
