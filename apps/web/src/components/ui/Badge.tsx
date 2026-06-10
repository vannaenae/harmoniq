import { type ReactNode } from 'react'
import { cn } from '@harmoniq/shared'

type BadgeTone =
  | 'neutral' | 'primary' | 'secondary' | 'tertiary' | 'accent'
  | 'success' | 'warning' | 'danger' | 'muted'
  | 'electric' | 'neon' | 'hot' | 'amber' | 'teal'

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

const toneClasses: Record<BadgeTone, string> = {
  neutral:   'bg-harmonic-surface text-harmonic-text',
  primary:   'bg-harmonic-primary/10 text-harmonic-primary',
  secondary: 'bg-harmonic-secondary/10 text-harmonic-secondary',
  tertiary:  'bg-harmonic-primary/10 text-harmonic-primary',
  accent:    'bg-harmonic-accent/10 text-harmonic-accent',
  success:   'bg-harmonic-success/15 text-[#248A3D]',
  warning:   'bg-harmonic-warning/15 text-[#C93400]',
  danger:    'bg-harmonic-danger/10 text-harmonic-danger',
  muted:     'bg-harmonic-surface text-harmonic-muted',
  electric:  'bg-harmonic-primary/10 text-harmonic-primary',
  neon:      'bg-harmonic-primary/10 text-harmonic-primary',
  hot:       'bg-harmonic-secondary/10 text-harmonic-secondary',
  amber:     'bg-harmonic-warning/15 text-[#C93400]',
  teal:      'bg-harmonic-teal/15 text-harmonic-teal',
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
