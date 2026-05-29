import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const fieldId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={fieldId} className="text-sm font-medium text-harmonic-text">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={fieldId}
          className={cn(
            'bg-harmonic-surface rounded-2xl px-4 py-3 text-sm',
            'outline-none border border-transparent resize-y min-h-[88px]',
            'focus:border-harmonic-primary transition-colors',
            'placeholder:text-harmonic-muted',
            error && 'border-harmonic-danger',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-harmonic-danger">{error}</p>}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
