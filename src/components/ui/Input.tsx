import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

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
            'bg-white/70 backdrop-blur-sm border border-white/60 rounded-pill px-4 py-2.5 text-sm',
            'outline-none transition-all',
            'focus:border-violet-400 focus:bg-white/90 focus:ring-2 focus:ring-violet-400/20',
            'placeholder:text-harmonic-muted',
            'min-h-[44px]',
            error && 'border-harmonic-danger focus:border-harmonic-danger focus:ring-red-400/20',
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
