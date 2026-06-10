import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BadgeTone = 'neutral' | 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'danger' | 'muted'

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
  className?: string
}

const toneClasses: Record<BadgeTone, string> = {
  neutral:   'bg-white/70 border border-harmonic-border text-harmonic-neutral backdrop-blur-sm',
  primary:   'bg-violet-100 border border-violet-200 text-violet-700',
  secondary: 'bg-rose-100 border border-rose-200 text-rose-600',
  tertiary:  'bg-purple-100 border border-purple-200 text-purple-700',
  accent:    'bg-sky-100 border border-sky-200 text-sky-700',
  success:   'bg-emerald-100 border border-emerald-200 text-emerald-700',
  warning:   'bg-amber-100 border border-amber-200 text-amber-700',
  danger:    'bg-red-100 border border-red-200 text-red-600',
  muted:     'bg-white/50 border border-harmonic-border text-harmonic-muted',
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
