import type { AvailabilityStatus, AttendanceStatus, ServiceStatus } from '@/types'

type Tone = 'success' | 'warning' | 'danger' | 'muted' | 'primary' | 'tertiary'

export const availabilityMeta: Record<AvailabilityStatus, { label: string; tone: Tone; color: string }> = {
  available:    { label: 'Available',   tone: 'success', color: '#2E7D5B' },
  not_sure:     { label: 'Not sure',    tone: 'warning', color: '#B8860B' },
  unavailable:  { label: 'Unavailable', tone: 'danger',  color: '#E5342B' },
  no_response:  { label: 'No response', tone: 'muted',   color: '#6B6770' },
}

export const attendanceMeta: Record<AttendanceStatus, { label: string; tone: Tone }> = {
  present:      { label: 'Present',     tone: 'success' },
  absent:       { label: 'Absent',      tone: 'danger' },
  unavailable:  { label: 'Excused',     tone: 'muted' },
}

export const serviceStatusMeta: Record<ServiceStatus, { label: string; tone: Tone }> = {
  draft:        { label: 'Draft',       tone: 'tertiary' },
  published:    { label: 'Published',   tone: 'success' },
}
