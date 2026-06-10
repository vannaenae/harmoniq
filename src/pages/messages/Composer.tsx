import { useEffect, useMemo, useRef, useState } from 'react'
import { Paperclip, ImagePlus, Send, X, FileText, Reply } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MAX_ATTACHMENT_BYTES } from '@/lib/messaging'
import { formatBytes } from './chatUtils'
import type { ReplyPreview } from '@/types'

interface PendingFileProps {
  file: File
  onRemove: () => void
}

function PendingFile({ file, onRemove }: PendingFileProps) {
  const url = useMemo(
    () => (file.type.startsWith('image/') ? URL.createObjectURL(file) : null),
    [file],
  )
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])

  return (
    <div className="relative flex-shrink-0 animate-scale-in">
      {url ? (
        <img src={url} alt={file.name} className="w-16 h-16 rounded-xl object-cover border border-black/[0.06]" />
      ) : (
        <div className="flex items-center gap-2 h-16 px-3 rounded-xl bg-harmonic-surface border border-black/[0.06] max-w-[180px]">
          <FileText size={18} className="text-harmonic-primary flex-shrink-0" aria-hidden="true" />
          <span className="min-w-0">
            <span className="block text-xs font-medium text-harmonic-text truncate">{file.name}</span>
            <span className="block text-[10px] text-harmonic-muted">{formatBytes(file.size)}</span>
          </span>
        </div>
      )}
      <button
        onClick={onRemove}
        aria-label={`Remove ${file.name}`}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-harmonic-neutral text-white flex items-center justify-center shadow-sm hover:bg-harmonic-danger transition-colors duration-150"
      >
        <X size={12} aria-hidden="true" />
      </button>
    </div>
  )
}

export interface ComposerProps {
  placeholder: string
  sending: boolean
  files: File[]
  onFilesChange: (files: File[]) => void
  replyTo?: ReplyPreview | null
  onCancelReply?: () => void
  onSend: (text: string) => void
  onTyping?: () => void
  autoFocus?: boolean
}

export function Composer({
  placeholder, sending, files, onFilesChange,
  replyTo, onCancelReply, onSend, onTyping, autoFocus,
}: ComposerProps) {
  const [text, setText] = useState('')
  const [fileError, setFileError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const canSend = (text.trim().length > 0 || files.length > 0) && !sending

  useEffect(() => {
    if (replyTo) textareaRef.current?.focus()
  }, [replyTo])

  const autoGrow = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  const addFiles = (incoming: File[]) => {
    const tooBig = incoming.filter(f => f.size > MAX_ATTACHMENT_BYTES)
    const ok = incoming.filter(f => f.size <= MAX_ATTACHMENT_BYTES)
    setFileError(tooBig.length > 0 ? `${tooBig[0].name} is over 10 MB` : null)
    if (ok.length > 0) onFilesChange([...files, ...ok].slice(0, 10))
  }

  const handleSend = () => {
    if (!canSend) return
    onSend(text.trim())
    setText('')
    requestAnimationFrame(() => {
      autoGrow()
      textareaRef.current?.focus()
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = Array.from(e.clipboardData.files)
    if (pasted.length > 0) {
      e.preventDefault()
      addFiles(pasted)
    }
  }

  return (
    <div className="px-4 pb-4 pt-2 flex-shrink-0">
      <div className="bg-white border border-black/[0.06] rounded-[22px] shadow-card overflow-hidden">
        {/* Reply preview */}
        {replyTo && (
          <div className="flex items-center gap-2.5 px-4 pt-3 animate-slide-up">
            <Reply size={14} className="text-harmonic-primary flex-shrink-0" aria-hidden="true" />
            <div className="flex-1 min-w-0 border-l-2 border-harmonic-primary pl-2.5">
              <p className="text-xs font-semibold text-harmonic-primary">{replyTo.authorName}</p>
              <p className="text-xs text-harmonic-muted truncate">
                {replyTo.text || (replyTo.hasAttachment ? '📎 Attachment' : '')}
              </p>
            </div>
            <button
              onClick={onCancelReply}
              aria-label="Cancel reply"
              className="p-1 rounded-full text-harmonic-muted hover:bg-harmonic-surface hover:text-harmonic-text transition-colors duration-150"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Pending attachments */}
        {files.length > 0 && (
          <div className="flex gap-2 px-4 pt-3 overflow-x-auto">
            {files.map((file, i) => (
              <PendingFile
                key={`${file.name}-${i}`}
                file={file}
                onRemove={() => onFilesChange(files.filter((_, j) => j !== i))}
              />
            ))}
          </div>
        )}

        {fileError && (
          <p className="px-4 pt-2 text-xs text-harmonic-danger animate-fade-in">{fileError}</p>
        )}

        {/* Input row */}
        <div className="flex items-end gap-1.5 px-2.5 py-2">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => { addFiles(Array.from(e.target.files ?? [])); e.target.value = '' }}
          />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={e => { addFiles(Array.from(e.target.files ?? [])); e.target.value = '' }}
          />

          <button
            onClick={() => imageInputRef.current?.click()}
            aria-label="Attach photos"
            className="p-2 rounded-full text-harmonic-muted hover:text-harmonic-primary hover:bg-harmonic-primary/10 transition-all duration-150 active:scale-90 flex-shrink-0"
          >
            <ImagePlus size={19} aria-hidden="true" />
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach files"
            className="p-2 rounded-full text-harmonic-muted hover:text-harmonic-primary hover:bg-harmonic-primary/10 transition-all duration-150 active:scale-90 flex-shrink-0"
          >
            <Paperclip size={19} aria-hidden="true" />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            autoFocus={autoFocus}
            onChange={e => { setText(e.target.value); autoGrow(); onTyping?.() }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            rows={1}
            className="flex-1 resize-none bg-transparent px-2 py-2 text-[15px] text-harmonic-text placeholder:text-harmonic-muted focus:outline-none max-h-40 overflow-y-auto"
            style={{ lineHeight: '1.45' }}
            aria-label={placeholder}
          />

          <button
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white mb-0.5',
              'transition-all duration-200 ease-out active:scale-90',
              canSend
                ? 'bg-harmonic-primary hover:brightness-110 scale-100'
                : 'bg-harmonic-muted/40 scale-95 cursor-not-allowed',
            )}
            aria-label="Send message"
          >
            <Send size={16} aria-hidden="true" className="-ml-0.5 mt-0.5" />
          </button>
        </div>
      </div>
      <p className="text-[10px] text-harmonic-muted mt-1.5 px-2 hidden md:block">
        Enter to send · Shift+Enter for new line · drag, paste or attach files
      </p>
    </div>
  )
}
