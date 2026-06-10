import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Mail, Shield, Music2, Trash2, Mic2, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { useChoir } from '@harmoniq/shared'
import {
  updateMemberRole,
  updateMemberVoicePart,
  updateMemberCanLead,
  removeMember,
  listVoicePartRequestsForMember,
  resolveVoicePartRequest,
  type VoicePartRequest,
} from '@harmoniq/shared'
import { getMemberAttendanceHistory, type AttendanceHistoryEntry } from '@harmoniq/shared'
import { Skeleton } from '@/components/ui/Skeleton'
import { voicePartLabel } from '@harmoniq/shared'
import { attendanceMeta } from '@harmoniq/shared'
import type { VoicePart, UserRole } from '@harmoniq/shared'

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

const requestStatusMeta: Record<VoicePartRequest['status'], { label: string; icon: typeof Clock; color: string }> = {
  pending:  { label: 'Pending',  icon: Clock,         color: 'text-harmonic-warning' },
  approved: { label: 'Approved', icon: CheckCircle2,  color: 'text-harmonic-success' },
  declined: { label: 'Declined', icon: XCircle,       color: 'text-harmonic-danger'  },
}

export function MemberProfile() {
  const { uid } = useParams<{ uid: string }>()
  const navigate = useNavigate()
  const { choir, members, isDirector, refreshMembers } = useChoir()
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [working, setWorking] = useState(false)
  const [history, setHistory] = useState<AttendanceHistoryEntry[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [voicePartRequests, setVoicePartRequests] = useState<VoicePartRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [resolvingId, setResolvingId] = useState<string | null>(null)

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

  useEffect(() => {
    if (!choir || !uid || !isDirector) return
    let active = true
    setLoadingRequests(true)
    listVoicePartRequestsForMember(choir.id, uid)
      .then(reqs => { if (active) setVoicePartRequests(reqs) })
      .catch(err => console.error('Load voice part requests error:', err))
      .finally(() => { if (active) setLoadingRequests(false) })
    return () => { active = false }
  }, [choir, uid, isDirector])

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
  const handleCanLead = async (value: boolean) => {
    if (!choir) return
    setWorking(true)
    try { await updateMemberCanLead(choir.id, member.uid, value); await refreshMembers() }
    finally { setWorking(false) }
  }
  const handleRemove = async () => {
    if (!choir) return
    setWorking(true)
    try { await removeMember(choir.id, member.uid); await refreshMembers(); navigate('/members') }
    finally { setWorking(false) }
  }
  const handleResolveRequest = async (req: VoicePartRequest, decision: 'approved' | 'declined') => {
    if (!choir) return
    setResolvingId(req.id)
    try {
      await resolveVoicePartRequest(choir.id, req.id, decision, req.uid, req.requestedPart)
      setVoicePartRequests(prev =>
        prev.map(r => r.id === req.id ? { ...r, status: decision } : r),
      )
      if (decision === 'approved') await refreshMembers()
    } catch (err) {
      console.error('Resolve voice part request error:', err)
    } finally {
      setResolvingId(null)
    }
  }

  const pendingRequests = voicePartRequests.filter(r => r.status === 'pending')
  const pastRequests = voicePartRequests.filter(r => r.status !== 'pending')

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        <PageHeader title="Member" back="/members" />

        {/* Identity */}
        <Card className="p-6 flex flex-col items-center text-center mb-5">
          <Avatar src={member.photoURL} name={name} size="xl" className="mb-3" />
          <h2 className="text-lg font-bold text-harmonic-text">{name}</h2>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-center">
            <Badge tone="tertiary">{voicePartLabel[member.voicePart] ?? member.voicePart}</Badge>
            <Badge tone={member.role === 'director' ? 'primary' : 'muted'}>
              {member.role === 'director' ? 'Director' : 'Member'}
            </Badge>
            {member.canLead && <Badge tone="success">Can lead</Badge>}
          </div>
          <a href={`mailto:${member.email}`} className="mt-4">
            <Button variant="outlined" size="sm" aria-label={`Email ${name}`}>
              <Mail size={16} /> Contact
            </Button>
          </a>
        </Card>

        {/* Voice part change requests (director only) */}
        {isDirector && (
          <section className="mb-5">
            <h3 className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-3">
              Voice part requests
            </h3>
            {loadingRequests ? (
              <Skeleton className="h-20 w-full rounded-card" />
            ) : voicePartRequests.length === 0 ? (
              <Card className="p-4">
                <p className="text-sm text-harmonic-muted text-center">No voice part change requests.</p>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {pendingRequests.map(req => (
                  <Card key={req.id} className="p-4 border-harmonic-warning/40 bg-harmonic-warning/5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-sm font-semibold text-harmonic-text">
                          {voicePartLabel[req.currentPart]} → {voicePartLabel[req.requestedPart]}
                        </p>
                        {req.note && (
                          <p className="text-xs text-harmonic-muted mt-0.5 italic">"{req.note}"</p>
                        )}
                      </div>
                      <Badge tone="warning">Pending</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleResolveRequest(req, 'approved')}
                        disabled={resolvingId === req.id}
                      >
                        <CheckCircle2 size={14} /> Approve
                      </Button>
                      <Button
                        variant="outlined"
                        size="sm"
                        onClick={() => handleResolveRequest(req, 'declined')}
                        disabled={resolvingId === req.id}
                      >
                        <XCircle size={14} /> Decline
                      </Button>
                    </div>
                  </Card>
                ))}
                {pastRequests.length > 0 && (
                  <Card className="divide-y divide-harmonic-border">
                    {pastRequests.map(req => {
                      const meta = requestStatusMeta[req.status]
                      const Icon = meta.icon
                      return (
                        <div key={req.id} className="flex items-center justify-between px-4 py-3 gap-3">
                          <span className="text-sm text-harmonic-text">
                            {voicePartLabel[req.currentPart]} → {voicePartLabel[req.requestedPart]}
                          </span>
                          <span className={`flex items-center gap-1 text-xs font-medium ${meta.color}`}>
                            <Icon size={13} aria-hidden="true" />
                            {meta.label}
                          </span>
                        </div>
                      )
                    })}
                  </Card>
                )}
              </div>
            )}
          </section>
        )}

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

              <div className="flex items-center justify-between gap-3 py-1">
                <div className="flex items-center gap-3">
                  <Mic2 size={18} className="text-harmonic-muted flex-shrink-0" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-medium text-harmonic-text">Can lead songs</p>
                    <p className="text-xs text-harmonic-muted">Eligible to be assigned as lead vocalist in set lists</p>
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={member.canLead ?? false}
                  aria-label="Toggle can lead"
                  disabled={working}
                  onClick={() => handleCanLead(!(member.canLead ?? false))}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-harmonic-primary focus:ring-offset-2 ${
                    member.canLead ? 'bg-harmonic-primary' : 'bg-harmonic-border'
                  } disabled:opacity-50`}
                >
                  <span
                    aria-hidden="true"
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      member.canLead ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
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
