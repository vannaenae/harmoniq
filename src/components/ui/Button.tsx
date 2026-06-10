import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'inverted' | 'outlined' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-gradient-to-r from-violet-600 to-rose-500 text-white shadow-lg shadow-violet-500/25 hover:brightness-105 hover:shadow-violet-500/40',
  secondary: 'bg-white/70 backdrop-blur-sm border border-white/70 text-harmonic-text shadow-card hover:bg-white/90 hover:shadow-card-hover',
  inverted:  'bg-harmonic-neutral text-white hover:opacity-90',
  outlined:  'bg-transparent border border-harmonic-border text-harmonic-text hover:bg-white/60 hover:border-violet-300',
  danger:    'bg-harmonic-danger text-white shadow-lg shadow-red-500/20 hover:opacity-90',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-xs',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-pill font-semibold transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-violet-500',
          'active:scale-[0.97]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'min-h-[44px]',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
