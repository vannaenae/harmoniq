import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Toggle } from '@/components/ui/Toggle'
import { Select } from '@/components/ui/Select'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { PageHeader } from '@/components/ui/PageHeader'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { createAnnouncement } from '@/lib/announcements'
import { createNotification } from '@/lib/notifications'
import { sanitizeHtml, htmlToText } from '@/lib/sanitize'
import type { VoicePart } from '@/types'

const AUDIENCE = [
  { value: 'all', label: 'All members' },
  { value: 'soprano', label: 'Sopranos' },
  { value: 'alto', label: 'Altos' },
  { value: 'tenor', label: 'Tenors' },
  { value: 'bass', label: 'Basses' },
]

export function CreateAnnouncement() {
  const navigate = useNavigate()
  const { firebaseUser, harmonicUser } = useAuth()
  const { choir, members } = useChoir()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [pinned, setPinned] = useState(false)
  const [audience, setAudience] = useState('all')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePublish = async () => {
    if (!choir || !firebaseUser) return
    if (!title.trim()) { setError('Please add a title.'); return }
    if (!htmlToText(body)) { setError('Please write a message.'); return }
    setError(null)
    setSaving(true)
    try {
      const authorName = harmonicUser?.preferredName || harmonicUser?.displayName || 'Director'
      const targetVoiceParts = audience === 'all' ? undefined : [audience as VoicePart]

      await createAnnouncement(choir.id, firebaseUser.uid, authorName, {
        title: title.trim(),
        body: sanitizeHtml(body),
        pinned,
        targetVoiceParts,
      })

      /* API_POINT: Notifications — notify targeted members of the new announcement. */
      const recipients = members.filter(
        m => m.uid !== firebaseUser.uid && (!targetVoiceParts || targetVoiceParts.includes(m.voicePart)),
      )
      await Promise.all(
        recipients.map(m =>
          createNotification(choir.id, m.uid, 'announcement', title.trim(), htmlToText(body).slice(0, 120), '/announcements'),
        ),
      )

      navigate('/announcements')
    } catch (err) {
      console.error('Create announcement error:', err)
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        <PageHeader
          title="New announcement"
          back="/announcements"
          actions={
            <Button variant="primary" size="sm" onClick={handlePublish} disabled={saving}>
              {saving ? 'Publishing…' : 'Publish'}
            </Button>
          }
        />

        <Card className="p-6 flex flex-col gap-5">
          {error && (
            <div role="alert" className="bg-red-50 border border-harmonic-danger/20 rounded-xl px-4 py-3 text-sm text-harmonic-danger">
              {error}
            </div>
          )}

          <Input label="Title" placeholder="e.g. Rehearsal moved to Thursday" value={title} onChange={e => setTitle(e.target.value)} />

          <RichTextEditor label="Message" value={body} onChange={setBody} placeholder="Write your message to the team…" />

          <Select label="Send to" value={audience} onValueChange={setAudience} options={AUDIENCE} />

          <div className="bg-harmonic-surface rounded-2xl p-4">
            <Toggle checked={pinned} onCheckedChange={setPinned} label="Pin to top" description="Pinned announcements stay at the top of the feed." />
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
