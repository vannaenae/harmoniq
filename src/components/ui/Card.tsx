import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'lg'
  variant?: 'default' | 'gradient' | 'glass'
  hoverable?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ size = 'default', variant = 'default', hoverable = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'border transition-all duration-200',
          size === 'lg' ? 'rounded-card-lg' : 'rounded-xl',
          variant === 'default' && 'bg-white border-harmonic-border/50 shadow-card',
          variant === 'gradient' && 'bg-gradient-hero border-transparent text-white',
          variant === 'glass' && 'bg-white/80 backdrop-blur-sm border-harmonic-border/30 shadow-card',
          hoverable && 'hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'
