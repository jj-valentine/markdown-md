import { useState, useRef, useCallback } from 'react'
import type { LucideIcon } from 'lucide-react'

interface ToolbarButtonProps {
  icon: LucideIcon
  label: string
  shortcut?: string
  isActive?: boolean
  disabled?: boolean
  onClick: () => void
}

const ICON_SIZE = 18
const ICON_STROKE = 1.5
const TOOLTIP_DELAY = 250

export default function ToolbarButton({ icon: Icon, label, shortcut, isActive, disabled, onClick }: ToolbarButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipX, setTooltipX] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const handleEnter = useCallback(() => {
    timerRef.current = setTimeout(() => setShowTooltip(true), TOOLTIP_DELAY)
  }, [])

  const handleLeave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    setShowTooltip(false)
    setTooltipX(null)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect()
      setTooltipX(e.clientX - rect.left)
    }
  }, [])

  return (
    <div
      ref={wrapperRef}
      className="toolbar-btn-wrapper"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseMove={handleMouseMove}
    >
      <button
        className={`toolbar-btn${isActive ? ' active' : ''}`}
        disabled={disabled}
        onMouseDown={(e) => {
          e.preventDefault()
          onClick()
          handleLeave()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick()
          }
        }}
      >
        <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </button>
      <div
        className={`toolbar-tooltip${showTooltip ? ' visible' : ''}`}
        style={tooltipX != null ? { left: `${tooltipX}px` } : undefined}
      >
        <span className="toolbar-tooltip-label">{label}</span>
        {shortcut && (
          <span className="toolbar-tooltip-shortcut">{shortcut}</span>
        )}
      </div>
    </div>
  )
}
