import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { nanoid } from 'nanoid'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateId = () => nanoid(8).toUpperCase()

export const generateInviteCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

export const formatShortDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const voicePartLabel: Record<string, string> = {
  soprano:          'Soprano',
  alto:             'Alto',
  tenor:            'Tenor',
  bass:             'Bass',
  unclassified:     'Unclassified',
  keys:             'Keys / Piano',
  guitar:           'Guitar',
  bass_guitar:      'Bass Guitar',
  drums:            'Drums',
  other_instrument: 'Other Instrument',
}

export const roleLabel: Record<string, string> = {
  director: 'Director',
  member:   'Member',
}

/** Map Spotify key integer (0–11) + mode (1=major, 0=minor) to letter notation */
export const spotifyKeyToNote = (key: number, mode: number): string => {
  const notes = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
  const note = notes[key] ?? '?'
  return mode === 1 ? note : `${note}m`
}

/** Build a CSV string from rows and trigger a browser download */
export const downloadCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const escape = (v: string | number) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [headers, ...rows].map(r => r.map(escape).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
