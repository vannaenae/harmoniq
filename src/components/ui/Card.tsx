import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'lg'
  variant?: 'default' | 'gradient' | 'glass' | 'electric' | 'dark' | 'neon' | 'hot' | 'amber'
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
          variant === 'default'   && 'bg-white border-harmonic-border/50 shadow-card',
          variant === 'gradient'  && 'bg-gradient-hero border-transparent text-white',
          variant === 'glass'     && 'bg-white/75 backdrop-blur-xl border-white/50 shadow-card',
          variant === 'electric'  && 'bg-gradient-card-electric border-harmonic-electric/20 shadow-card',
          variant === 'dark'      && 'bg-harmonic-sidebarAlt border-harmonic-borderDark text-harmonic-onDark shadow-card-neon',
          variant === 'neon'      && 'bg-gradient-card-neon border-harmonic-hot/20 shadow-card',
          variant === 'hot'       && 'bg-gradient-neon border-transparent text-white',
          variant === 'amber'     && 'bg-gradient-hot border-transparent text-white',
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
