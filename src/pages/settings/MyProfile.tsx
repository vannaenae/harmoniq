import { useState } from 'react'
import { Link } from 'react-router-dom'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Check, ChevronRight } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Toggle } from '@/components/ui/Toggle'
import { PageHeader } from '@/components/ui/PageHeader'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { voicePartLabel, roleLabel } from '@/lib/utils'
import { DEFAULT_NOTIFICATION_PREFS } from '@/types'

export function MyProfile() {
  const { firebaseUser, harmonicUser, refreshUser } = useAuth()
  const { choir } = useChoir()

  const [preferredName, setPreferredName] = useState(harmonicUser?.preferredName ?? '')
  const [notifEnabled, setNotifEnabled] = useState(
    harmonicUser?.notificationPrefs?.announcements ?? DEFAULT_NOTIFICATION_PREFS.announcements,
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const name = harmonicUser?.displayName ?? firebaseUser?.displayName ?? ''

  const handleSave = async () => {
    if (!firebaseUser) return
    setSaving(true)
    setError(null)
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        preferredName: preferredName.trim() || null,
        'notificationPrefs.announcements': notifEnabled,
        updatedAt: serverTimestamp(),
      })
      await refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Save profile error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        <PageHeader title="My profile" back="/settings" />

        {/* Identity (read-only) */}
        <Card className="p-6 flex flex-col items-center text-center mb-5">
          <Avatar src={harmonicUser?.photoURL ?? firebaseUser?.photoURL} name={name} size="xl" className="mb-3" />
          <h2 className="text-lg font-bold text-harmonic-text">{name}</h2>
          <p className="text-sm text-harmonic-muted">{firebaseUser?.email}</p>
          <div className="flex items-center gap-2 mt-3">
            {harmonicUser?.voicePart && <Badge tone="tertiary">{voicePartLabel[harmonicUser.voicePart]}</Badge>}
            {harmonicUser?.role && <Badge tone={harmonicUser.role === 'director' ? 'primary' : 'muted'}>{roleLabel[harmonicUser.role]}</Badge>}
          </div>
        </Card>

        {/* Editable preferred name */}
        <Card className="p-6 mb-5 space-y-4">
          <Input
            label="Preferred display name"
            placeholder="How you'd like to appear"
            value={preferredName}
            onChange={e => setPreferredName(e.target.value)}
          />

          {/* Voice part with request-change link */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-harmonic-text">Voice part</p>
              <p className="text-xs text-harmonic-muted mt-0.5">{harmonicUser?.voicePart ? voicePartLabel[harmonicUser.voicePart] : 'Not set'}</p>
            </div>
            <Link to="/profile/voice-part">
              <Button variant="outlined" size="sm">Request change</Button>
            </Link>
          </div>

          <div className="bg-harmonic-surface rounded-2xl p-4">
            <Toggle
              checked={notifEnabled}
              onCheckedChange={setNotifEnabled}
              label="Announcement notifications"
              description="Get notified when your director posts an announcement."
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-harmonic-danger">{error}</p>
          )}

          <div className="flex justify-end">
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saved ? <><Check size={16} /> Saved</> : saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </Card>

        {/* Current choir */}
        <Card className="p-5 mb-5">
          <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-1">Choir</p>
          <p className="text-sm font-medium text-harmonic-text">{choir?.name}</p>
          {choir?.churchName && <p className="text-xs text-harmonic-muted">{choir.churchName}</p>}
        </Card>

        {/* Quick links */}
        <Card className="divide-y divide-harmonic-border">
          <Link to="/my-attendance" className="flex items-center justify-between px-4 py-3.5 hover:bg-harmonic-surface/50 transition-colors">
            <span className="text-sm text-harmonic-text">My attendance history</span>
            <ChevronRight size={16} className="text-harmonic-muted" aria-hidden="true" />
          </Link>
          <Link to="/settings/notifications" className="flex items-center justify-between px-4 py-3.5 hover:bg-harmonic-surface/50 transition-colors">
            <span className="text-sm text-harmonic-text">Notification settings</span>
            <ChevronRight size={16} className="text-harmonic-muted" aria-hidden="true" />
          </Link>
        </Card>
      </div>
    </AppLayout>
  )
}
