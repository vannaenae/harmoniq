import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Megaphone, Plus, Pin } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { subscribeAnnouncements, markAnnouncementRead, type AnnouncementWithRead } from '@/lib/announcements'
import { sanitizeHtml, htmlToText } from '@/lib/sanitize'
import { formatShortDate, cn } from '@/lib/utils'

export function AnnouncementsFeed() {
  const { firebaseUser, harmonicUser } = useAuth()
  const { choir, isDirector } = useChoir()
  const [items, setItems] = useState<AnnouncementWithRead[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!choir) return
    setLoading(true)
    const unsub = subscribeAnnouncements(
      choir.id,
      harmonicUser?.voicePart,
      a => { setItems(a); setLoading(false) },
      err => { console.error('Load announcements error:', err); setLoading(false) },
    )
    return unsub
  }, [choir, harmonicUser?.voicePart])

  const handleExpand = (id: string) => {
    const opening = expanded !== id
    setExpanded(opening ? id : null)
    if (opening && choir && firebaseUser) {
      const a = items.find(x => x.id === id)
      if (a && !a.readBy.includes(firebaseUser.uid)) {
        markAnnouncementRead(choir.id, id, firebaseUser.uid)
        setItems(prev => prev.map(x => (x.id === id ? { ...x, readBy: [...x.readBy, firebaseUser.uid] } : x)))
      }
    }
  }

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        <PageHeader
          title="Announcements"
          subtitle={choir?.name}
          actions={
            isDirector ? (
              <Link to="/announcements/new">
                <Button variant="primary" size="sm"><Plus size={16} /> New</Button>
              </Link>
            ) : undefined
          }
        />

        {loading ? (
          <div className="space-y-3"><SkeletonCard /><SkeletonCard /></div>
        ) : items.length === 0 ? (
          <Card className="p-2">
            <EmptyState
              icon={Megaphone}
              title="Nothing from the director yet"
              description="Check back soon."
              action={
                isDirector ? (
                  <Link to="/announcements/new"><Button variant="primary" size="sm"><Plus size={16} /> Post one</Button></Link>
                ) : undefined
              }
            />
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map(a => {
              const unread = firebaseUser ? !a.readBy.includes(firebaseUser.uid) : false
              const isOpen = expanded === a.id
              return (
                <Card key={a.id} className="overflow-hidden">
                  <button
                    onClick={() => handleExpand(a.id)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-4 hover:bg-harmonic-surface/50 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      {a.pinned && <Pin size={14} className="text-harmonic-secondary mt-1 flex-shrink-0" aria-label="Pinned" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={cn('text-sm text-harmonic-text', unread ? 'font-bold' : 'font-medium')}>
                            {a.title}
                          </p>
                          {unread && <span className="w-2 h-2 rounded-full bg-harmonic-secondary flex-shrink-0" aria-label="Unread" />}
                        </div>
                        {isOpen ? (
                          <div
                            className="text-sm text-harmonic-text mt-2 leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                            // body is sanitized on save AND here as defence-in-depth
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(a.body) }}
                          />
                        ) : (
                          <p className="text-sm text-harmonic-muted mt-1 line-clamp-2">{htmlToText(a.body)}</p>
                        )}
                        <p className="text-xs text-harmonic-muted mt-2">
                          {a.authorName} · {formatShortDate(a.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
