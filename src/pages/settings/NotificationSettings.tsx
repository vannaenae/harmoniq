import { useState } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Check } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { PageHeader } from '@/components/ui/PageHeader'
import { db } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { DEFAULT_NOTIFICATION_PREFS, type NotificationPrefs } from '@/types'
import { cn } from '@/lib/utils'

export function NotificationSettings() {
  const { firebaseUser, harmonicUser, refreshUser } = useAuth()
  const [prefs, setPrefs] = useState<NotificationPrefs>(
    harmonicUser?.notificationPrefs ?? DEFAULT_NOTIFICATION_PREFS,
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = <K extends keyof NotificationPrefs>(key: K, value: NotificationPrefs[K]) =>
    setPrefs(p => ({ ...p, [key]: value }))

  const handleSave = async () => {
    if (!firebaseUser) return
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        notificationPrefs: prefs,
        updatedAt: serverTimestamp(),
      })
      await refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Save notification prefs error:', err)
    } finally {
      setSaving(false)
    }
  }

  const toggles: { key: keyof NotificationPrefs; label: string; desc: string }[] = [
    { key: 'serviceUpdates', label: 'Service updates', desc: 'New services and set list changes.' },
    { key: 'availabilityReminders', label: 'Availability reminders', desc: 'Nudges to mark your availability.' },
    { key: 'announcements', label: 'Announcements', desc: "Messages from your director." },
    { key: 'system', label: 'System', desc: 'Account and choir updates.' },
  ]

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        <PageHeader title="Notification settings" back="/settings" />

        {/* Per-type toggles */}
        <Card className="p-5 mb-5 space-y-4">
          {toggles.map(({ key, label, desc }, i) => (
            <div key={key} className={cn(i > 0 && 'pt-4 border-t border-harmonic-border')}>
              <Toggle
                checked={prefs[key] as boolean}
                onCheckedChange={v => set(key, v)}
                label={label}
                description={desc}
              />
            </div>
          ))}
        </Card>

        {/* Reminder timing */}
        <Card className="p-5 mb-5">
          <p className="text-sm font-medium text-harmonic-text mb-1">Availability reminder timing</p>
          <p className="text-xs text-harmonic-muted mb-3">When to remind you before a service.</p>
          <div className="flex gap-2" role="radiogroup" aria-label="Reminder timing">
            {(['48h', '24h'] as const).map(t => (
              <button
                key={t}
                role="radio"
                aria-checked={prefs.reminderTiming === t}
                onClick={() => set('reminderTiming', t)}
                className={cn(
                  'flex-1 px-4 py-3 rounded-card border-2 text-sm font-medium transition-all min-h-[48px]',
                  prefs.reminderTiming === t
                    ? 'border-harmonic-primary bg-harmonic-primary/5 text-harmonic-primary'
                    : 'border-harmonic-border bg-white text-harmonic-text hover:border-harmonic-primary/40',
                )}
              >
                {t === '48h' ? '48 hours before' : '24 hours before'}
              </button>
            ))}
          </div>
        </Card>

        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saved ? <><Check size={16} /> Saved</> : saving ? 'Saving…' : 'Save settings'}
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
