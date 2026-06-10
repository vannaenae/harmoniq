import { useRef, useEffect } from 'react'
import { Bold, Italic, List } from 'lucide-react'
import { cn } from '@harmoniq/shared'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  label?: string
  placeholder?: string
}

/** Minimal rich-text editor: bold, italic, bullet list.
 *  Uses contentEditable + execCommand (broadly supported); output is sanitized
 *  on save by the caller. */
export function RichTextEditor({ value, onChange, label, placeholder }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Initialise content once (avoid clobbering caret on each keystroke)
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const exec = (command: string) => {
    document.execCommand(command, false)
    ref.current?.focus()
    if (ref.current) onChange(ref.current.innerHTML)
  }

  const tools = [
    { cmd: 'bold', icon: Bold, label: 'Bold' },
    { cmd: 'italic', icon: Italic, label: 'Italic' },
    { cmd: 'insertUnorderedList', icon: List, label: 'Bullet list' },
  ]

  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-sm font-medium text-harmonic-text">{label}</span>}
      <div className="rounded-2xl border border-harmonic-border overflow-hidden bg-white">
        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-harmonic-border bg-harmonic-surface" role="toolbar" aria-label="Text formatting">
          {tools.map(({ cmd, icon: Icon, label: l }) => (
            <button
              key={cmd}
              type="button"
              onMouseDown={e => { e.preventDefault(); exec(cmd) }}
              aria-label={l}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-harmonic-muted hover:bg-white hover:text-harmonic-text transition-colors"
            >
              <Icon size={16} aria-hidden="true" />
            </button>
          ))}
        </div>
        <div
          ref={ref}
          contentEditable
          role="textbox"
          aria-multiline="true"
          aria-label={label ?? 'Announcement body'}
          data-placeholder={placeholder}
          onInput={() => ref.current && onChange(ref.current.innerHTML)}
          className={cn(
            'min-h-[140px] px-4 py-3 text-sm text-harmonic-text outline-none',
            'empty:before:content-[attr(data-placeholder)] empty:before:text-harmonic-muted',
            '[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5',
          )}
        />
      </div>
    </div>
  )
}
