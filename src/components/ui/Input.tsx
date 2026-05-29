import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-harmonic-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'bg-harmonic-surface rounded-pill px-4 py-2.5 text-sm',
            'outline-none border border-transparent',
            'focus:border-harmonic-primary transition-colors',
            'placeholder:text-harmonic-muted',
            'min-h-[44px]',
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
Input.displayName = 'Input'
