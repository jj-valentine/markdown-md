import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Editor } from '@tiptap/react'

interface HeadingDropdownProps {
  editor: Editor
}

const levels = [
  { label: 'Paragraph', value: 0 },
  { label: 'Heading 1', value: 1 },
  { label: 'Heading 2', value: 2 },
  { label: 'Heading 3', value: 3 },
  { label: 'Heading 4', value: 4 },
  { label: 'Heading 5', value: 5 },
  { label: 'Heading 6', value: 6 },
]

export default function HeadingDropdown({ editor }: HeadingDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
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

  const select = (value: number) => {
    if (value === 0) {
      editor.chain().focus().setParagraph().run()
    } else {
      editor.chain().focus().setHeading({ level: value as 1|2|3|4|5|6 }).run()
    }
    setOpen(false)
  }

  return (
    <div className="heading-dropdown" ref={ref}>
      <button
        className="heading-dropdown-trigger"
        onMouseDown={(e) => {
          e.preventDefault()
          setOpen(!open)
        }}
      >
        <span className="heading-dropdown-label">{current}</span>
        <ChevronDown size={14} strokeWidth={1.5} />
      </button>
      {open && (
        <div className="heading-dropdown-menu">
          {levels.map(({ label, value }) => (
            <button
              key={value}
              className={`heading-dropdown-item${(value === 0 ? current === 'P' : current === `H${value}`) ? ' active' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault()
                select(value)
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
