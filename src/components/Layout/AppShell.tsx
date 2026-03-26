import { useState } from 'react'
import {
  FileText,
  Clock,
  FolderOpen,
  Settings,
  Download
} from 'lucide-react'
import MarkdownEditor from '../Editor/MarkdownEditor'
import Toolbar from '../Toolbar/Toolbar'
import StatusBar from '../StatusBar/StatusBar'
import { useEditorStore } from '../../stores/editor-store'
import type { TiptapEditorHandle } from '../Editor/TiptapEditor'

const ICON_SIZE = 18
const ICON_STROKE = 1.5

const sidebarItems = [
  { icon: FileText, label: 'Documents', active: true },
  { icon: Clock, label: 'Recent' },
  { icon: FolderOpen, label: 'Browse' },
]

export default function AppShell() {
  const { fileName, isDirty } = useEditorStore()
  const [editorHandle, setEditorHandle] = useState<TiptapEditorHandle | null>(null)

  return (
    <div className="app-shell">
      {/* Top bar */}
      <header className="topbar drag-region">
        <span className="topbar-title no-drag">{fileName}{isDirty ? ' •' : ''}</span>
        <div className="topbar-actions no-drag">
          <button className="sidebar-btn" title="Export">
            <Download size={ICON_SIZE} strokeWidth={ICON_STROKE} />
          </button>
        </div>
      </header>

      {/* Left sidebar */}
      <nav className="sidebar">
        {sidebarItems.map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`sidebar-btn${active ? ' active' : ''}`}
            title={label}
          >
            <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} />
          </button>
        ))}
        <div className="sidebar-spacer" />
        <button className="sidebar-btn" title="Settings">
          <Settings size={ICON_SIZE} strokeWidth={ICON_STROKE} />
        </button>
      </nav>

      {/* Toolbar */}
      <Toolbar editor={editorHandle?.editor ?? null} />

      {/* Editor */}
      <MarkdownEditor onEditorReady={setEditorHandle} />

      {/* Status bar */}
      <StatusBar />
    </div>
  )
}
