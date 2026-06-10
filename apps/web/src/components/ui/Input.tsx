import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@harmoniq/shared'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
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
            'outline-none border border-transparent transition-all duration-200',
            'focus:bg-white focus:border-harmonic-primary/40 focus:ring-4 focus:ring-harmonic-primary/10',
            'placeholder:text-harmonic-muted',
            'min-h-[44px]',
            error && 'border-harmonic-danger focus:border-harmonic-danger focus:ring-harmonic-danger/10',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-harmonic-danger">{error}</p>}
        {!error && helperText && <p className="text-xs text-harmonic-muted">{helperText}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
