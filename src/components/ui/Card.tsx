import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'lg'
}

export function Card({ size = 'default', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-harmonic-surface shadow-card',
        size === 'lg' ? 'rounded-card-lg' : 'rounded-card',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
