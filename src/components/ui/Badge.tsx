import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BadgeTone = 'neutral' | 'primary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'muted'

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

const toneClasses: Record<BadgeTone, string> = {
  neutral:  'bg-harmonic-neutral/10 text-harmonic-neutral',
  primary:  'bg-harmonic-primary/10 text-harmonic-primary',
  tertiary: 'bg-harmonic-tertiary/10 text-harmonic-tertiary',
  success:  'bg-harmonic-success/10 text-harmonic-success',
  warning:  'bg-harmonic-warning/10 text-harmonic-warning',
  danger:   'bg-harmonic-danger/10 text-harmonic-danger',
  muted:    'bg-harmonic-muted/10 text-harmonic-muted',
}

export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-medium whitespace-nowrap',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
