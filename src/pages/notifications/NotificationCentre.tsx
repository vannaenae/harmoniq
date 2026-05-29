import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CalendarClock, Megaphone, Settings as Cog, CalendarDays } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { listMyNotifications, markNotificationRead, markAllRead } from '@/lib/notifications'
import { cn } from '@/lib/utils'
import type { AppNotification, NotificationCategory } from '@/types'

const categoryMeta: Record<NotificationCategory, { label: string; icon: typeof Bell; tone: string }> = {
  service_update:        { label: 'Service Updates', icon: CalendarDays, tone: 'text-harmonic-primary' },
  availability_reminder: { label: 'Availability Reminders', icon: CalendarClock, tone: 'text-harmonic-warning' },
  announcement:          { label: 'Announcements', icon: Megaphone, tone: 'text-harmonic-secondary' },
  system:                { label: 'System', icon: Cog, tone: 'text-harmonic-muted' },
}

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - +date) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function NotificationCentre() {
  const navigate = useNavigate()
  const { firebaseUser } = useAuth()
  const { choir } = useChoir()
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!choir || !firebaseUser) return
    let active = true
    setLoading(true)
    listMyNotifications(choir.id, firebaseUser.uid)
      .then(n => { if (active) setItems(n) })
      .catch(err => console.error('Load notifications error:', err))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [choir, firebaseUser])

  const hasUnread = items.some(n => !n.read)

  const handleClick = async (n: AppNotification) => {
    if (choir && !n.read) {
      await markNotificationRead(choir.id, n.id)
      setItems(prev => prev.map(x => (x.id === n.id ? { ...x, read: true } : x)))
    }
    if (n.deepLink) navigate(n.deepLink)
  }

  const handleMarkAll = async () => {
    if (!choir || !firebaseUser) return
    await markAllRead(choir.id, firebaseUser.uid)
    setItems(prev => prev.map(x => ({ ...x, read: true })))
  }

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        <PageHeader
          title="Notifications"
          actions={
            hasUnread ? (
              <button onClick={handleMarkAll} className="text-sm font-medium text-harmonic-primary hover:opacity-80 min-h-[40px]">
                Mark all as read
              </button>
            ) : undefined
          }
        />

        {loading ? (
          <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
        ) : items.length === 0 ? (
          <Card className="p-2">
            <EmptyState icon={Bell} title="You're all caught up" description="Updates, reminders, and announcements will show up here." />
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map(n => {
              const meta = categoryMeta[n.category]
              const Icon = meta.icon
              return (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    'w-full text-left flex items-start gap-3 p-4 rounded-card transition-colors',
                    n.read ? 'bg-white' : 'bg-harmonic-surface',
                    'hover:shadow-card',
                  )}
                >
                  <span className={cn('w-9 h-9 rounded-full bg-harmonic-surface flex items-center justify-center flex-shrink-0', n.read && 'bg-harmonic-background')}>
                    <Icon size={16} className={meta.tone} aria-hidden="true" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn('text-sm text-harmonic-text', !n.read && 'font-semibold')}>{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-harmonic-secondary flex-shrink-0" aria-label="Unread" />}
                    </div>
                    <p className="text-xs text-harmonic-muted mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-[11px] text-harmonic-muted mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
