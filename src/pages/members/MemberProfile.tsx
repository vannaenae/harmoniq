import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Mail, Shield, Music2, Trash2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { useChoir } from '@/contexts/ChoirContext'
import { updateMemberRole, updateMemberVoicePart, removeMember } from '@/lib/members'
import { getMemberAttendanceHistory, type AttendanceHistoryEntry } from '@/lib/attendance'
import { Skeleton } from '@/components/ui/Skeleton'
import { voicePartLabel } from '@/lib/utils'
import { attendanceMeta } from '@/lib/status'
import type { VoicePart, UserRole } from '@/types'

const PART_OPTIONS = [
  { value: 'soprano', label: 'Soprano' },
  { value: 'alto', label: 'Alto' },
  { value: 'tenor', label: 'Tenor' },
  { value: 'bass', label: 'Bass' },
  { value: 'unclassified', label: 'Unclassified' },
]
const ROLE_OPTIONS = [
  { value: 'member', label: 'Member' },
  { value: 'director', label: 'Director' },
]

export function MemberProfile() {
  const { uid } = useParams<{ uid: string }>()
  const navigate = useNavigate()
  const { choir, members, isDirector, refreshMembers } = useChoir()
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [working, setWorking] = useState(false)
  const [history, setHistory] = useState<AttendanceHistoryEntry[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  const member = members.find(m => m.uid === uid)

  useEffect(() => {
    if (!choir || !uid) return
    let active = true
    setLoadingHistory(true)
    getMemberAttendanceHistory(choir.id, uid, 5)
      .then(h => { if (active) setHistory(h.filter(e => e.status !== 'no_record')) })
      .catch(err => console.error('Load history error:', err))
      .finally(() => { if (active) setLoadingHistory(false) })
    return () => { active = false }
  }, [choir, uid])

  if (!member) {
    return (
      <AppLayout>
        <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
          <PageHeader title="Member" back="/members" />
          <Card className="p-2">
            <EmptyState title="Member not found" description="They may have left the choir." />
          </Card>
        </div>
      </AppLayout>
    )
  }

  const name = member.preferredName || member.displayName

  const handleRole = async (role: string) => {
    if (!choir) return
    setWorking(true)
    try { await updateMemberRole(choir.id, member.uid, role as UserRole); await refreshMembers() }
    finally { setWorking(false) }
  }
  const handlePart = async (part: string) => {
    if (!choir) return
    setWorking(true)
    try { await updateMemberVoicePart(choir.id, member.uid, part as VoicePart); await refreshMembers() }
    finally { setWorking(false) }
  }
  const handleRemove = async () => {
    if (!choir) return
    setWorking(true)
    try { await removeMember(choir.id, member.uid); await refreshMembers(); navigate('/members') }
    finally { setWorking(false) }
  }

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        <PageHeader title="Member" back="/members" />

        {/* Identity */}
        <Card className="p-6 flex flex-col items-center text-center mb-5">
          <Avatar src={member.photoURL} name={name} size="xl" className="mb-3" />
          <h2 className="text-lg font-bold text-harmonic-text">{name}</h2>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge tone="tertiary">{voicePartLabel[member.voicePart] ?? member.voicePart}</Badge>
            <Badge tone={member.role === 'director' ? 'primary' : 'muted'}>
              {member.role === 'director' ? 'Director' : 'Member'}
            </Badge>
          </div>
          <a href={`mailto:${member.email}`} className="mt-4">
            <Button variant="outlined" size="sm" aria-label={`Email ${name}`}>
              <Mail size={16} /> Contact
            </Button>
          </a>
        </Card>

        {/* Attendance history */}
        <section className="mb-5">
          <h3 className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-3">
            Recent attendance
          </h3>
          {loadingHistory ? (
            <Skeleton className="h-32 w-full rounded-card" />
          ) : history.length === 0 ? (
            <Card className="p-4">
              <p className="text-sm text-harmonic-muted text-center">No attendance recorded yet.</p>
            </Card>
          ) : (
            <Card className="divide-y divide-harmonic-border">
              {history.map(({ service, status }) => (
                <div key={service.id} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-harmonic-text truncate">{service.title}</span>
                  {status !== 'no_record' && (
                    <Badge tone={attendanceMeta[status].tone}>{attendanceMeta[status].label}</Badge>
                  )}
                </div>
              ))}
            </Card>
          )}
        </section>

        {/* Director controls */}
        {isDirector && (
          <section>
            <h3 className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-3">
              Director controls
            </h3>
            <Card className="p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-harmonic-muted flex-shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  <Select label="Role" value={member.role} onValueChange={handleRole} options={ROLE_OPTIONS} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Music2 size={18} className="text-harmonic-muted flex-shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  <Select label="Voice part" value={member.voicePart} onValueChange={handlePart} options={PART_OPTIONS} />
                </div>
              </div>

              <div className="pt-2 border-t border-harmonic-border">
                <Button variant="danger" size="sm" onClick={() => setConfirmRemove(true)} disabled={working}>
                  <Trash2 size={16} /> Remove from choir
                </Button>
              </div>
            </Card>
          </section>
        )}
      </div>

      <Modal
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title={`Remove ${name}?`}
        description="They'll lose access to this choir. You can always invite them back later."
        footer={
          <>
            <Button variant="outlined" onClick={() => setConfirmRemove(false)} disabled={working}>Cancel</Button>
            <Button variant="danger" onClick={handleRemove} disabled={working}>
              {working ? 'Removing…' : 'Remove'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-harmonic-muted">
          This removes {name} from {choir?.name}. Their availability history stays on past services.
        </p>
      </Modal>
    </AppLayout>
  )
}
