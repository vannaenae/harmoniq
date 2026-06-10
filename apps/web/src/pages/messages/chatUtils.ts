import type { Message } from '@harmoniq/shared'

export function formatMsgTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function formatDay(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

/** Compact timestamp for channel list rows: 14:32 / Yesterday / Mon / 03/06/26 */
export function formatListTime(date: Date): string {
  const now = new Date()
  if (date.toDateString() === now.toDateString()) return formatMsgTime(date)
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 6)
  if (date > weekAgo) return date.toLocaleDateString('en-GB', { weekday: 'short' })
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

/** Short relative time for thread pills: now / 5m / 2h / 3d */
export function formatRelative(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const GROUP_WINDOW_MS = 5 * 60 * 1000

/** Same author posting within 5 minutes — collapse into one visual group. */
export function isSameGroup(prev: Message | undefined, msg: Message): boolean {
  if (!prev) return false
  return (
    prev.authorId === msg.authorId &&
    msg.createdAt.getTime() - prev.createdAt.getTime() < GROUP_WINDOW_MS &&
    prev.createdAt.toDateString() === msg.createdAt.toDateString()
  )
}

export interface DayGroup {
  day: string
  messages: Message[]
}

export function groupByDay(messages: Message[]): DayGroup[] {
  const grouped: DayGroup[] = []
  let currentDay = ''
  for (const msg of messages) {
    const day = msg.createdAt.toDateString()
    if (day !== currentDay) {
      grouped.push({ day: formatDay(msg.createdAt), messages: [msg] })
      currentDay = day
    } else {
      grouped[grouped.length - 1].messages.push(msg)
    }
  }
  return grouped
}
