import type { LucideIcon } from 'lucide-react'

interface ToolbarButtonProps {
  icon: LucideIcon
  label: string
  isActive?: boolean
  disabled?: boolean
  onClick: () => void
}

const ICON_SIZE = 18
const ICON_STROKE = 1.5

export default function ToolbarButton({ icon: Icon, label, isActive, disabled, onClick }: ToolbarButtonProps) {
  return (
    <button
      className={`toolbar-btn${isActive ? ' active' : ''}`}
      title={label}
      disabled={disabled}
      onMouseDown={(e) => {
        // Prevent focus steal from editor
        e.preventDefault()
        onClick()
      }}
    >
      <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} />
    </button>
  )
}
