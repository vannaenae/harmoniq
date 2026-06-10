import { useState } from 'react'
import { UserCheck, Check } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { createNotification } from '@harmoniq/shared'
import { voicePartLabel } from '@harmoniq/shared'
import { availabilityMeta } from '@harmoniq/shared'
import type { ChoirMember, Availability, AvailabilityStatus } from '@harmoniq/shared'

interface SubstitutionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  choirId: string
  serviceId: string
  unavailableMember: ChoirMember
  members: ChoirMember[]
  availability: Record<string, Availability>
}

export function SubstitutionModal({
  open,
  onOpenChange,
  choirId,
  serviceId,
  unavailableMember,
  members,
  availability,
}: SubstitutionModalProps) {
  const [assignedId, setAssignedId] = useState<string | null>(null)
  const [assigning, setAssigning] = useState<string | null>(null)

  const statusFor = (uid: string): AvailabilityStatus => availability[uid]?.status ?? 'no_response'

  // Candidates: same voice part, available, not the unavailable member
  const candidates = members.filter(
    m =>
      m.uid !== unavailableMember.uid &&
      m.voicePart === unavailableMember.voicePart &&
      statusFor(m.uid) === 'available',
  )

  const handleAssign = async (sub: ChoirMember) => {
    setAssigning(sub.uid)
    try {
      /* API_POINT: Notifications — in-app delivery only for v1; FCM push is v2.
         Writes a notification record the substitute sees in their Notification Centre. */
      await createNotification(
        choirId,
        sub.uid,
        'service_update',
        "You're covering a service",
        `You've been asked to cover ${unavailableMember.voicePart} for an upcoming service.`,
        `/services/${serviceId}`,
      )
      setAssignedId(sub.uid)
    } catch (err) {
      console.error('Assign substitute error:', err)
    } finally {
      setAssigning(null)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Find a substitute"
      description={`${unavailableMember.preferredName || unavailableMember.displayName} can't make it.`}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-harmonic-muted">Needs cover for</span>
          <Badge tone="tertiary">{voicePartLabel[unavailableMember.voicePart] ?? unavailableMember.voicePart}</Badge>
        </div>

        {candidates.length === 0 ? (
          <p className="text-sm text-harmonic-muted py-6 text-center">
            No available members in this voice part right now. Try checking in with the team directly.
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest">
              Available {voicePartLabel[unavailableMember.voicePart]?.toLowerCase()}s
            </p>
            {candidates.map(c => {
              const done = assignedId === c.uid
              return (
                <div key={c.uid} className="flex items-center gap-3 p-2.5 rounded-xl bg-harmonic-surface">
                  <Avatar src={c.photoURL} name={c.preferredName || c.displayName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-harmonic-text truncate">
                      {c.preferredName || c.displayName}
                    </p>
                    <span className="text-xs" style={{ color: availabilityMeta.available.color }}>
                      Available
                    </span>
                  </div>
                  {done ? (
                    <span className="flex items-center gap-1 text-xs font-medium text-harmonic-success">
                      <Check size={14} /> Asked
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAssign(c)}
                      disabled={assigning !== null}
                    >
                      <UserCheck size={14} /> Ask
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}
