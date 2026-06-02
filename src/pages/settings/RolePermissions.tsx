import { useMemo } from 'react'
import { Shield, Users, Music, Calendar, Bell, UserPlus, Check, X } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { useChoir } from '@/contexts/ChoirContext'
import { Navigate } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface Permission {
  label: string
  director: boolean
  member: boolean
}

interface PermissionGroup {
  title: string
  icon: typeof Shield
  permissions: Permission[]
}

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    title: 'Repertoire & Sets',
    icon: Music,
    permissions: [
      { label: 'Create and edit set lists', director: true, member: false },
      { label: 'Add songs to library', director: true, member: false },
      { label: 'View set lists and songs', director: true, member: true },
    ],
  },
  {
    title: 'Scheduling & Availability',
    icon: Calendar,
    permissions: [
      { label: 'Create services and rehearsals', director: true, member: false },
      { label: 'Manage availability requests', director: true, member: false },
      { label: 'Mark own availability', director: true, member: true },
    ],
  },
  {
    title: 'Members & Roles',
    icon: Users,
    permissions: [
      { label: 'Invite new members', director: true, member: false },
      { label: 'Change member roles', director: true, member: false },
      { label: 'Remove members', director: true, member: false },
      { label: 'View member directory', director: true, member: true },
    ],
  },
  {
    title: 'Communication',
    icon: Bell,
    permissions: [
      { label: 'Broadcast announcements', director: true, member: false },
      { label: 'View announcements', director: true, member: true },
      { label: 'Send messages', director: true, member: true },
    ],
  },
  {
    title: 'Choir Settings',
    icon: Shield,
    permissions: [
      { label: 'Edit choir name and details', director: true, member: false },
      { label: 'Manage invite codes', director: true, member: false },
      { label: 'Delete choir', director: true, member: false },
    ],
  },
]

function PermissionBadge({ allowed }: { allowed: boolean }) {
  return (
    <span
      className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
        allowed ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400',
      )}
    >
      {allowed ? <Check size={14} /> : <X size={14} />}
    </span>
  )
}

export function RolePermissions() {
  const { isDirector, members } = useChoir()

  const memberCounts = useMemo(() => {
    const directors = members.filter(m => m.role === 'director').length
    const vocalists = members.filter(m => m.role === 'member').length
    return { directors, vocalists }
  }, [members])

  if (!isDirector) {
    return <Navigate to="/settings" replace />
  }

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        <PageHeader
          title="Role Permissions"
          subtitle="Manage what each role can do in your choir"
          back="/settings"
        />

        {/* Role overview cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-featured-song-gradient">
                <Shield size={18} className="text-white" />
              </span>
              <div>
                <p className="text-sm font-semibold text-harmonic-text">Director</p>
                <p className="text-xs text-harmonic-muted">Full administrative access</p>
              </div>
              <span className="ml-auto text-xs font-medium text-harmonic-muted bg-harmonic-surface rounded-full px-2.5 py-1">
                {memberCounts.directors} {memberCounts.directors === 1 ? 'member' : 'members'}
              </span>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-harmonic-surface flex items-center justify-center flex-shrink-0">
                <UserPlus size={18} className="text-harmonic-primary" />
              </span>
              <div>
                <p className="text-sm font-semibold text-harmonic-text">Member</p>
                <p className="text-xs text-harmonic-muted">Standard view access</p>
              </div>
              <span className="ml-auto text-xs font-medium text-harmonic-muted bg-harmonic-surface rounded-full px-2.5 py-1">
                {memberCounts.vocalists} {memberCounts.vocalists === 1 ? 'member' : 'members'}
              </span>
            </div>
          </Card>
        </div>

        {/* Permission groups */}
        <div className="space-y-4">
          {PERMISSION_GROUPS.map(group => (
            <Card key={group.title} className="overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-harmonic-border">
                <group.icon size={16} className="text-harmonic-primary flex-shrink-0" />
                <h3 className="text-sm font-semibold text-harmonic-text">{group.title}</h3>
              </div>

              {/* Column headers */}
              <div className="flex items-center gap-3 px-4 py-2 border-b border-harmonic-border bg-harmonic-background/50">
                <span className="flex-1 text-xs font-medium text-harmonic-muted uppercase tracking-wide">Permission</span>
                <span className="w-16 text-center text-xs font-medium text-harmonic-muted uppercase tracking-wide">Director</span>
                <span className="w-16 text-center text-xs font-medium text-harmonic-muted uppercase tracking-wide">Member</span>
              </div>

              {/* Permission rows */}
              <div className="divide-y divide-harmonic-border">
                {group.permissions.map(perm => (
                  <div key={perm.label} className="flex items-center gap-3 px-4 py-3">
                    <span className="flex-1 text-sm text-harmonic-text">{perm.label}</span>
                    <span className="w-16 flex justify-center">
                      <PermissionBadge allowed={perm.director} />
                    </span>
                    <span className="w-16 flex justify-center">
                      <PermissionBadge allowed={perm.member} />
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-harmonic-muted mt-8">
          Role permissions are system-defined and cannot be customized at this time.
        </p>
      </div>
    </AppLayout>
  )
}
