import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BadgeTone = 'neutral' | 'primary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'muted'

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

const toneClasses: Record<BadgeTone, string> = {
  neutral:  'bg-harmonic-neutral/12 text-harmonic-neutral border border-harmonic-neutral/20',
  primary:  'bg-harmonic-primary/12 text-harmonic-primary border border-harmonic-primary/20',
  tertiary: 'bg-gradient-card-accent text-harmonic-tertiary border border-harmonic-tertiary/20',
  success:  'bg-harmonic-success/15 text-harmonic-success border border-harmonic-success/25',
  warning:  'bg-harmonic-warning/15 text-harmonic-warning border border-harmonic-warning/25',
  danger:   'bg-harmonic-danger/12 text-harmonic-danger border border-harmonic-danger/20',
  muted:    'bg-harmonic-muted/10 text-harmonic-muted border border-harmonic-border',
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
