import { useState } from 'react'
import TiptapEditor from './components/Editor/TiptapEditor'
import Toolbar from './components/Toolbar/Toolbar'
import type { Editor } from '@tiptap/react'

import './styles/reset.css'
import './styles/tokens.css'
import './styles/layout.css'
import './styles/editor-content.css'

export default function App() {
  const [editor, setEditor] = useState<Editor | null>(null)

  return (
    <div className="app-shell">
      <Toolbar editor={editor} />
      <div className="editor-area">
        <TiptapEditor onEditorReady={setEditor} />
      </div>
      <div className="status-bar">
        <span>markdown-md</span>
      </div>
    </div>
  )
}
