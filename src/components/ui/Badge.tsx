import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BadgeTone = 'neutral' | 'primary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'muted' | 'electric' | 'neon' | 'hot' | 'amber' | 'teal'

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

const toneClasses: Record<BadgeTone, string> = {
  neutral:  'bg-harmonic-neutral/10 text-harmonic-neutral border border-harmonic-neutral/20',
  primary:  'bg-harmonic-primary/10 text-harmonic-primary border border-harmonic-primary/20',
  tertiary: 'bg-gradient-card-accent text-harmonic-tertiary border border-harmonic-tertiary/20',
  success:  'bg-harmonic-successBg text-harmonic-success border border-harmonic-success/30',
  warning:  'bg-harmonic-warningBg text-harmonic-warning border border-harmonic-warning/30',
  danger:   'bg-harmonic-dangerBg text-harmonic-danger border border-harmonic-danger/30',
  muted:    'bg-harmonic-muted/10 text-harmonic-muted border border-harmonic-border',
  electric: 'bg-harmonic-electric/12 text-harmonic-electric border border-harmonic-electric/25',
  neon:     'bg-harmonic-neon/12 text-harmonic-neon border border-harmonic-neon/25',
  hot:      'bg-harmonic-hot/12 text-harmonic-hot border border-harmonic-hot/25',
  amber:    'bg-harmonic-amber/12 text-harmonic-amber border border-harmonic-amber/25',
  teal:     'bg-harmonic-teal/12 text-harmonic-teal border border-harmonic-teal/25',
}

export function Badge({ tone = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-semibold whitespace-nowrap',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
