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
          'bg-white border border-black/[0.04] shadow-card transition-shadow duration-300',
          size === 'lg' ? 'rounded-card-lg' : 'rounded-card',
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
