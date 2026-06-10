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
  primary:   'bg-harmonic-primary text-white hover:brightness-110',
  secondary: 'bg-harmonic-surface text-harmonic-text hover:bg-harmonic-border/70',
  inverted:  'bg-harmonic-neutral text-white hover:opacity-90',
  outlined:  'bg-transparent border border-harmonic-border text-harmonic-text hover:bg-harmonic-surface',
  danger:    'bg-harmonic-danger text-white hover:brightness-110',
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
          'inline-flex items-center justify-center gap-2 rounded-pill font-semibold',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-harmonic-primary',
          'active:scale-[0.97]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          'min-h-[44px]', // accessibility: minimum touch target
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
