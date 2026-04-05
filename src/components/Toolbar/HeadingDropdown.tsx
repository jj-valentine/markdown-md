import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Editor } from '@tiptap/react'

interface HeadingDropdownProps {
  editor: Editor
}

const levels = [
  { label: 'Paragraph', value: 0, shortcut: '⌥⇧P' },
  { label: 'Heading 1', value: 1, shortcut: '⌥⇧1' },
  { label: 'Heading 2', value: 2, shortcut: '⌥⇧2' },
  { label: 'Heading 3', value: 3, shortcut: '⌥⇧3' },
  { label: 'Heading 4', value: 4, shortcut: '⌥⇧4' },
  { label: 'Heading 5', value: 5, shortcut: '⌥⇧5' },
  { label: 'Heading 6', value: 6, shortcut: '⌥⇧6' },
]

const TOOLTIP_DELAY = 250

export default function HeadingDropdown({ editor }: HeadingDropdownProps) {
  const [open, setOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        requestAnimationFrame(() => setOpen(false))
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const current = (() => {
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive('heading', { level: i })) return `H${i}`
    }
    return 'P'
  })()

  const currentLevel = levels.find(l => (l.value === 0 ? current === 'P' : current === `H${l.value}`))

  const select = (value: number) => {
    if (value === 0) {
      editor.chain().focus().setParagraph().run()
    } else {
      editor.chain().focus().setHeading({ level: value as 1|2|3|4|5|6 }).run()
    }
    setOpen(false)
  }

  const handleEnter = useCallback(() => {
    timerRef.current = setTimeout(() => setShowTooltip(true), TOOLTIP_DELAY)
  }, [])

  const handleLeave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    setShowTooltip(false)
  }, [])

  return (
    <div
      className="heading-dropdown"
      ref={ref}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className="heading-dropdown-trigger"
        onMouseDown={(e) => {
          e.preventDefault()
          setOpen(!open)
          handleLeave()
        }}
      >
        <span className="heading-dropdown-label">{current}</span>
        <ChevronDown size={14} strokeWidth={1.5} />
      </button>
      <div className={`toolbar-tooltip${showTooltip && !open ? ' visible' : ''}`}>
        <span className="toolbar-tooltip-label">{currentLevel?.label ?? 'Paragraph'}</span>
        {currentLevel && (
          <span className="toolbar-tooltip-shortcut">{currentLevel.shortcut}</span>
        )}
      </div>
      {open && (
        <div className="heading-dropdown-menu">
          {levels.map(({ label, value, shortcut }) => (
            <button
              key={value}
              className={`heading-dropdown-item${(value === 0 ? current === 'P' : current === `H${value}`) ? ' active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault()
                select(value)
              }}
            >
              <span>{label}</span>
              <span className="heading-dropdown-shortcut">{shortcut}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
