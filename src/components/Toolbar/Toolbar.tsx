import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Minus,
  Undo2,
  Redo2,
  Highlighter,
} from 'lucide-react'
import type { Editor } from '@tiptap/react'

interface ToolbarProps {
  editor: Editor | null
}

export default function Toolbar({ editor }: ToolbarProps) {
  if (!editor) return <div className="toolbar" />

  const btn = (
    action: () => boolean,
    isActive: boolean,
    icon: React.ReactNode,
    title: string
  ) => (
    <button
      className={`toolbar-button${isActive ? ' active' : ''}`}
      onClick={() => action()}
      title={title}
    >
      {icon}
    </button>
  )

  const iconSize = 16

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        {btn(
          () => editor.chain().focus().undo().run(),
          false,
          <Undo2 size={iconSize} />,
          'Undo'
        )}
        {btn(
          () => editor.chain().focus().redo().run(),
          false,
          <Redo2 size={iconSize} />,
          'Redo'
        )}
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        {btn(
          () => editor.chain().focus().toggleBold().run(),
          editor.isActive('bold'),
          <Bold size={iconSize} />,
          'Bold'
        )}
        {btn(
          () => editor.chain().focus().toggleItalic().run(),
          editor.isActive('italic'),
          <Italic size={iconSize} />,
          'Italic'
        )}
        {btn(
          () => editor.chain().focus().toggleStrike().run(),
          editor.isActive('strike'),
          <Strikethrough size={iconSize} />,
          'Strikethrough'
        )}
        {btn(
          () => editor.chain().focus().toggleCode().run(),
          editor.isActive('code'),
          <Code size={iconSize} />,
          'Inline Code'
        )}
        {btn(
          () => editor.chain().focus().toggleHighlight().run(),
          editor.isActive('highlight'),
          <Highlighter size={iconSize} />,
          'Highlight'
        )}
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        {btn(
          () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          editor.isActive('heading', { level: 1 }),
          <Heading1 size={iconSize} />,
          'Heading 1'
        )}
        {btn(
          () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          editor.isActive('heading', { level: 2 }),
          <Heading2 size={iconSize} />,
          'Heading 2'
        )}
        {btn(
          () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
          editor.isActive('heading', { level: 3 }),
          <Heading3 size={iconSize} />,
          'Heading 3'
        )}
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        {btn(
          () => editor.chain().focus().toggleBulletList().run(),
          editor.isActive('bulletList'),
          <List size={iconSize} />,
          'Bullet List'
        )}
        {btn(
          () => editor.chain().focus().toggleOrderedList().run(),
          editor.isActive('orderedList'),
          <ListOrdered size={iconSize} />,
          'Ordered List'
        )}
        {btn(
          () => editor.chain().focus().toggleTaskList().run(),
          editor.isActive('taskList'),
          <ListChecks size={iconSize} />,
          'Task List'
        )}
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        {btn(
          () => editor.chain().focus().toggleBlockquote().run(),
          editor.isActive('blockquote'),
          <Quote size={iconSize} />,
          'Blockquote'
        )}
        {btn(
          () => editor.chain().focus().setHorizontalRule().run(),
          false,
          <Minus size={iconSize} />,
          'Horizontal Rule'
        )}
      </div>
    </div>
  )
}
