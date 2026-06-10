import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@harmoniq/shared'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'lg'
  /** Visual variants kept for existing pages; all resolve to the restrained palette */
  variant?: 'default' | 'gradient' | 'glass' | 'electric' | 'dark' | 'neon' | 'hot' | 'amber'
  hoverable?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ size = 'default', variant = 'default', hoverable = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'transition-all duration-200',
          size === 'lg' ? 'rounded-card-lg' : 'rounded-card',
          variant === 'default'  && 'bg-white border border-black/[0.04] shadow-card',
          variant === 'glass'    && 'bg-white/75 backdrop-blur-xl border border-white/50 shadow-card',
          (variant === 'gradient' || variant === 'dark') &&
            'bg-gradient-hero border border-transparent text-white shadow-card',
          (variant === 'electric' || variant === 'neon') &&
            'bg-gradient-card-electric border border-harmonic-primary/15 shadow-card',
          variant === 'hot'      && 'bg-gradient-card-neon border border-harmonic-primary/15 shadow-card',
          variant === 'amber'    && 'bg-gradient-card-accent border border-harmonic-primary/15 shadow-card',
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
