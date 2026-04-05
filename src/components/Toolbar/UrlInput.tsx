import { useState, useRef, useEffect } from 'react'

interface UrlInputProps {
  label: string
  initialValue?: string
  initialDisplayText?: string
  showDisplayText?: boolean
  showRemove?: boolean
  onSubmit: (url: string, displayText?: string) => void
  onRemove?: () => void
  onCancel: () => void
}

export default function UrlInput({
  label,
  initialValue = '',
  initialDisplayText,
  showDisplayText,
  showRemove,
  onSubmit,
  onRemove,
  onCancel,
}: UrlInputProps) {
  const [url, setUrl] = useState(initialValue)
  const [displayText, setDisplayText] = useState(initialDisplayText ?? '')
  const urlRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    urlRef.current?.focus()
    if (initialValue) urlRef.current?.select()
  }, [])

  // Close on outside click — rAF delay avoids catching the click that opened us
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onCancel()
      }
    }
    const id = requestAnimationFrame(() => {
      document.addEventListener('mousedown', handler)
    })
    return () => {
      cancelAnimationFrame(id)
      document.removeEventListener('mousedown', handler)
    }
  }, [])

  const handleSubmit = () => {
    const trimmedUrl = url.trim()
    if (trimmedUrl) {
      onSubmit(trimmedUrl, showDisplayText ? displayText.trim() || undefined : undefined)
    } else {
      onCancel()
    }
  }

  return (
    <div className="url-input-popover" ref={popoverRef}>
      {showDisplayText && (
        <>
          <label className="url-input-label">Text</label>
          <input
            className="url-input-field"
            type="text"
            placeholder="Display text..."
            value={displayText}
            onChange={(e) => setDisplayText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') urlRef.current?.focus()
              if (e.key === 'Escape') onCancel()
            }}
          />
        </>
      )}
      <label className="url-input-label">{label}</label>
      <input
        ref={urlRef}
        className="url-input-field"
        type="url"
        placeholder="https://..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit()
          if (e.key === 'Escape') onCancel()
          if ((e.key === 'Tab' || e.key === ' ') && url.trim() === '') {
            e.preventDefault()
            setUrl('https://')
          }
        }}
      />
      <div className="url-input-actions">
        {showRemove && onRemove && (
          <button className="url-input-btn url-input-remove" onMouseDown={(e) => { e.preventDefault(); onRemove() }}>
            Remove
          </button>
        )}
        <div className="url-input-spacer" />
        <button className="url-input-btn url-input-cancel" onMouseDown={(e) => { e.preventDefault(); onCancel() }}>
          Cancel
        </button>
        <button className="url-input-btn url-input-submit" onMouseDown={(e) => { e.preventDefault(); handleSubmit() }}>
          Apply
        </button>
      </div>
    </div>
  )
}
