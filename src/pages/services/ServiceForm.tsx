import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { CalendarCheck } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Toggle } from '@/components/ui/Toggle'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { createService, updateService, getService, getSetList, type ServiceInput } from '@/lib/firestore'
import { createCalendarEvent } from '@/lib/integrations'

export function ServiceForm() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const isEditing = Boolean(serviceId)
  const navigate = useNavigate()
  const { firebaseUser } = useAuth()
  const { choir } = useChoir()

  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [theme, setTheme] = useState('')
  const [scriptureRef, setScriptureRef] = useState('')
  const [calendarSync, setCalendarSync] = useState(false)

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState<'draft' | 'publish' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isEditing || !choir || !serviceId) return
    let active = true
    getService(choir.id, serviceId)
      .then(s => {
        if (!s || !active) return
        setTitle(s.title)
        setDate(s.date.toISOString().slice(0, 10))
        setTime(s.time ?? '')
        setTheme(s.theme ?? '')
        setScriptureRef(s.scriptureRef ?? '')
      })
      .catch(err => console.error('Load service error:', err))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [isEditing, choir, serviceId])

  const handleSave = async (status: 'draft' | 'published') => {
    if (!choir || !firebaseUser) return
    if (!title.trim()) { setError('Please give your service a title.'); return }
    if (!date) { setError('Please pick a service date.'); return }

    setError(null)
    setSaving(status === 'draft' ? 'draft' : 'publish')
    try {
      const input: ServiceInput = {
        title: title.trim(),
        date: new Date(`${date}T${time || '00:00'}`),
        time: time || undefined,
        theme: theme.trim() || undefined,
        scriptureRef: scriptureRef.trim() || undefined,
        status,
        calendarSync,
      }

      const targetId = isEditing && serviceId
        ? (await updateService(choir.id, serviceId, input), serviceId)
        : await createService(choir.id, firebaseUser.uid, input)

      /* API_POINT: Google Calendar — on publish with sync on, create an event
         (description lists the set list song titles) and store the shareable link. */
      if (calendarSync && status === 'published') {
        try {
          const setlist = await getSetList(choir.id, targetId)
          const songLines = setlist.map((s, i) => `${i + 1}. ${s.title}${s.artist ? ` — ${s.artist}` : ''}`).join('\n')
          const start = new Date(`${date}T${time || '10:00'}`)
          const end = new Date(start.getTime() + 2 * 60 * 60 * 1000) // default 2h
          const result = await createCalendarEvent({
            summary: title.trim(),
            description: songLines ? `Set list:\n${songLines}` : 'Set list to be confirmed.',
            startISO: start.toISOString(),
            endISO: end.toISOString(),
          })
          if (result) {
            // store calendar refs (best-effort)
            await import('firebase/firestore').then(({ doc, updateDoc }) =>
              updateDoc(doc(db, 'choirs', choir.id, 'services', targetId), {
                calendarEventId: result.eventId,
                calendarLink: result.calendarLink,
              })
            ).catch(() => {})
          }
        } catch (calErr) {
          console.warn('Calendar sync skipped:', calErr)
        }
      }

      navigate(isEditing ? `/services/${targetId}/setlist` : `/services/${targetId}/setlist`)
    } catch (err) {
      console.error('Save service error:', err)
      setError('Something went wrong. Please try again.')
      setSaving(null)
    }
  }

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        <PageHeader title={isEditing ? 'Edit service' : 'New service'} back="/services" />

        {loading ? (
          <Card className="p-6 space-y-4">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </Card>
        ) : (
          <Card className="p-6 flex flex-col gap-5">
            {error && (
              <div role="alert" className="bg-red-50 border border-harmonic-danger/20 rounded-xl px-4 py-3 text-sm text-harmonic-danger">
                {error}
              </div>
            )}

            <Input
              label="Service title"
              placeholder="e.g. Sunday Morning Service"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input label="Service date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
              <Input label="Service time" type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>

            <Input
              label="Theme (optional)"
              placeholder="e.g. Faithfulness"
              value={theme}
              onChange={e => setTheme(e.target.value)}
            />

            <Textarea
              label="Scripture reference (optional)"
              placeholder="e.g. Lamentations 3:22-23"
              value={scriptureRef}
              onChange={e => setScriptureRef(e.target.value)}
              className="min-h-[64px]"
            />

            {/* Google Calendar sync toggle (wired in Phase 4) */}
            <div className="bg-harmonic-surface rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <CalendarCheck size={16} className="text-harmonic-primary" aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <Toggle
                    checked={calendarSync}
                    onCheckedChange={setCalendarSync}
                    label="Add to Google Calendar"
                    description="Creates an event and a shareable link members can add to their own calendar."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outlined" onClick={() => handleSave('draft')} disabled={saving !== null}>
                {saving === 'draft' ? 'Saving…' : 'Save draft'}
              </Button>
              <Button variant="primary" onClick={() => handleSave('published')} disabled={saving !== null}>
                {saving === 'publish' ? 'Publishing…' : 'Publish'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
