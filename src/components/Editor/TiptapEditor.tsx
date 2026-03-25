import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import type { Editor } from '@tiptap/react'

const SAMPLE_CONTENT = `
<h1>Welcome to markdown-md</h1>
<p>Start typing here. This is your writing surface.</p>
<h2>Formatting</h2>
<p>You can write with <strong>bold</strong>, <em>italic</em>, <s>strikethrough</s>, and <code>inline code</code>.</p>
<blockquote><p>Blockquotes look like this.</p></blockquote>
<h3>Lists</h3>
<ul>
  <li><p>Unordered list item</p></li>
  <li><p>Another item</p></li>
</ul>
<ol>
  <li><p>Ordered list item</p></li>
  <li><p>Second item</p></li>
</ol>
<h3>Code</h3>
<pre><code>function hello() {
  console.log("Hello from markdown-md");
}</code></pre>
<hr>
<p>That's it for now. Delete this content and make it yours.</p>
`

interface TiptapEditorProps {
  onEditorReady?: (editor: Editor) => void
}

export default function TiptapEditor({ onEditorReady }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: { class: 'code-block' },
        },
      }),
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer' },
      }),
      Image,
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
      Typography,
    ],
    content: SAMPLE_CONTENT,
    onCreate: ({ editor }) => {
      onEditorReady?.(editor as Editor)
    },
    editorProps: {
      attributes: {
        class: 'tiptap',
      },
    },
  })

  if (!editor) return null

  return (
    <div className="tiptap-wrapper">
      <EditorContent editor={editor} />
    </div>
  )
}
