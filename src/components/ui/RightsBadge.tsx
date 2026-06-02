import { Globe, FileCheck2, FileX2, Music, HelpCircle } from 'lucide-react'
import type { RightsStatus } from '@/types'
import { cn } from '@/lib/utils'

interface RightsBadgeProps {
  status: RightsStatus
  publisher?: string
  ccliNumber?: string
  className?: string
}

const META: Record<RightsStatus, { label: string; tone: string; Icon: typeof Globe }> = {
  public_domain: {
    label: 'Public domain',
    tone: 'bg-harmonic-success/10 text-harmonic-success',
    Icon: Globe,
  },
  ccli_required: {
    label: 'CCLI required',
    tone: 'bg-harmonic-warning/10 text-harmonic-warning',
    Icon: FileCheck2,
  },
  royalty_free: {
    label: 'Royalty free',
    tone: 'bg-harmonic-primary/10 text-harmonic-primary',
    Icon: Music,
  },
  unlicensed: {
    label: 'Unlicensed',
    tone: 'bg-harmonic-danger/10 text-harmonic-danger',
    Icon: FileX2,
  },
  unknown: {
    label: 'Rights unknown',
    tone: 'bg-harmonic-muted/10 text-harmonic-muted',
    Icon: HelpCircle,
  },
}

export function RightsBadge({ status, publisher, ccliNumber, className }: RightsBadgeProps) {
  const { label, tone, Icon } = META[status]
  const tooltipParts: string[] = []
  if (publisher) tooltipParts.push(publisher)
  if (ccliNumber) tooltipParts.push(`CCLI #${ccliNumber}`)
  const title = tooltipParts.length > 0 ? `${label} — ${tooltipParts.join(' · ')}` : label

  return (
    <span
      title={title}
      aria-label={title}
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-pill text-xs font-medium whitespace-nowrap',
        tone,
        className,
      )}
    >
      <Icon size={12} aria-hidden="true" />
      {label}
    </span>
  )
}
