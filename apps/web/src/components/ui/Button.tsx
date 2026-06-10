import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@harmoniq/shared'

type Variant = 'primary' | 'secondary' | 'inverted' | 'outlined' | 'danger' | 'gradient' | 'electric' | 'neon' | 'ghost'
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
  // Legacy variant names — all resolve to the single indigo accent
  gradient:  'bg-harmonic-primary text-white hover:brightness-110',
  electric:  'bg-harmonic-primary text-white hover:brightness-110',
  neon:      'bg-harmonic-primary text-white hover:brightness-110',
  ghost:     'bg-transparent text-harmonic-primary hover:bg-harmonic-primary/10',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-xs min-h-[36px]',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
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
