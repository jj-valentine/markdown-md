import { useEditorStore } from '../../stores/editor-store'

export default function StatusBar() {
  const { fileName, isDirty, wordCount } = useEditorStore()

  return (
    <footer className="statusbar">
      <span className="statusbar-item">
        {fileName}{isDirty ? ' •' : ''}
      </span>
      <span className="statusbar-spacer" />
      <span className="statusbar-item">{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
      <span className="statusbar-item">UTF-8</span>
      <span className="statusbar-item">Markdown</span>
    </footer>
  )
}
