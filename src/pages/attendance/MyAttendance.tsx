import { useEffect, useState } from 'react'
import { Flame, CalendarCheck } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { getMemberAttendanceHistory, computeStreak, type AttendanceHistoryEntry } from '@/lib/attendance'
import { attendanceMeta } from '@/lib/status'
import { formatShortDate } from '@/lib/utils'

export function MyAttendance() {
  const { firebaseUser } = useAuth()
  const { choir } = useChoir()
  const [history, setHistory] = useState<AttendanceHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!choir || !firebaseUser) return
    let active = true
    setLoading(true)
    getMemberAttendanceHistory(choir.id, firebaseUser.uid, 10)
      .then(h => { if (active) setHistory(h) })
      .catch(err => console.error('Load attendance history error:', err))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [choir, firebaseUser])

  const recorded = history.filter(h => h.status !== 'no_record')
  const streak = computeStreak(history)

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        <PageHeader title="My attendance" subtitle="Your last 10 services" back="/profile" />

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-card" />
            <Skeleton className="h-16 w-full rounded-card" />
            <Skeleton className="h-16 w-full rounded-card" />
          </div>
        ) : recorded.length === 0 ? (
          <Card className="p-2">
            <EmptyState
              icon={CalendarCheck}
              title="No attendance yet"
              description="Once you've been part of a service, your history shows up here."
            />
          </Card>
        ) : (
          <>
            {/* Streak */}
            <Card className="p-5 mb-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-harmonic-warning/10 flex items-center justify-center flex-shrink-0">
                <Flame size={24} className="text-harmonic-warning" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl font-bold text-harmonic-text">
                  {streak} {streak === 1 ? 'service' : 'services'}
                </p>
                <p className="text-sm text-harmonic-muted">
                  {streak > 0 ? "You're on a roll — keep it up!" : 'Show up to start a streak.'}
                </p>
              </div>
            </Card>

            {/* History list */}
            <Card className="divide-y divide-harmonic-border">
              {recorded.map(({ service, status }) => (
                <div key={service.id} className="flex items-center justify-between px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-harmonic-text truncate">{service.title}</p>
                    <p className="text-xs text-harmonic-muted">{formatShortDate(service.date)}</p>
                  </div>
                  {status !== 'no_record' && (
                    <Badge tone={attendanceMeta[status].tone}>{attendanceMeta[status].label}</Badge>
                  )}
                </div>
              ))}
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  )
}
