import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ size = 'default', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white border border-harmonic-border',
          size === 'lg' ? 'rounded-xl' : 'rounded-xl',
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
