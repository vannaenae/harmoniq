import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Music4,
  Bell,
  Shield,
  FileText,
  LogOut,
  Trash2,
  ChevronRight,
  Users,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'

export function Settings() {
  const navigate = useNavigate()
  const { signOut, harmonicUser, firebaseUser } = useAuth()
  const { choir, isDirector } = useChoir()
  const [signOutOpen, setSignOutOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    navigate('/sign-in', { replace: true })
  }

  const name = harmonicUser?.preferredName ?? harmonicUser?.displayName ?? firebaseUser?.displayName ?? 'You'
  const role = isDirector ? 'Director' : 'Member'

  const accountRows = [
    {
      to: '/profile',
      label: 'My profile',
      description: 'Name, photo, voice part',
      icon: User,
      iconBg: 'bg-gradient-to-br from-harmonic-primary to-harmonic-tertiary',
      show: true,
    },
    {
      to: '/settings/notifications',
      label: 'Notifications',
      description: 'Manage alerts and reminders',
      icon: Bell,
      iconBg: 'bg-gradient-to-br from-harmonic-warning to-amber-400',
      show: true,
    },
  ]

  const choirRows = [
    {
      to: '/settings/choir',
      label: 'Choir settings',
      description: 'Name, schedule, invite code',
      icon: Music4,
      iconBg: 'bg-gradient-to-br from-harmonic-violet to-harmonic-indigo',
      show: isDirector,
    },
    {
      to: '/settings/roles',
      label: 'Role permissions',
      description: 'Manage member access',
      icon: Users,
      iconBg: 'bg-gradient-to-br from-harmonic-indigo to-harmonic-primary',
      show: isDirector,
    },
  ].filter(r => r.show)

  const legalRows = [
    {
      to: '/privacy',
      label: 'Privacy policy',
      icon: Shield,
      iconBg: 'bg-gradient-to-br from-harmonic-success to-emerald-400',
      show: true,
    },
    {
      to: '/terms',
      label: 'Terms of service',
      icon: FileText,
      iconBg: 'bg-gradient-to-br from-harmonic-muted to-gray-400',
      show: true,
    },
  ]

  return (
    <AppLayout>
      <div className="px-5 py-6 max-w-2xl mx-auto md:px-8">

        {/* Profile hero */}
        <div className="relative rounded-2xl bg-gradient-hero px-5 py-5 mb-7 overflow-hidden animate-fade-in-down">
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/8 blur-xl" aria-hidden="true" />
          <div className="flex items-center gap-4 relative">
            <Avatar
              src={firebaseUser?.photoURL ?? harmonicUser?.photoURL}
              name={name}
              size="lg"
              className="ring-2 ring-white/30 flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="font-bold text-white text-lg leading-tight truncate">{name}</p>
              <p className="text-white/70 text-sm mt-0.5">{role} · {choir?.name ?? 'No choir'}</p>
            </div>
            <Link
              to="/profile"
              className="ml-auto flex-shrink-0 text-xs font-semibold text-white/80 bg-white/15 border border-white/20 rounded-full px-3 py-1.5 hover:bg-white/25 transition-colors"
            >
              Edit
            </Link>
          </div>
        </div>

        {/* Account section */}
        <div className="mb-5 animate-fade-in-up">
          <p className="text-[11px] font-bold text-harmonic-muted uppercase tracking-widest mb-2.5 px-1">Account</p>
          <Card className="divide-y divide-harmonic-border/60">
            {accountRows.map(({ to, label, description, icon: Icon, iconBg }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-harmonic-surface/40 transition-colors group"
              >
                <span className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <Icon size={16} className="text-white" aria-hidden="true" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-harmonic-text group-hover:text-harmonic-primary transition-colors">{label}</p>
                  {description && <p className="text-xs text-harmonic-muted mt-0.5">{description}</p>}
                </div>
                <ChevronRight size={15} className="text-harmonic-muted group-hover:translate-x-0.5 group-hover:text-harmonic-primary transition-all" aria-hidden="true" />
              </Link>
            ))}
          </Card>
        </div>

        {/* Choir section — director only */}
        {choirRows.length > 0 && (
          <div className="mb-5 animate-fade-in-up delay-50">
            <p className="text-[11px] font-bold text-harmonic-muted uppercase tracking-widest mb-2.5 px-1">Choir</p>
            <Card className="divide-y divide-harmonic-border/60">
              {choirRows.map(({ to, label, description, icon: Icon, iconBg }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-harmonic-surface/40 transition-colors group"
                >
                  <span className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <Icon size={16} className="text-white" aria-hidden="true" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-harmonic-text group-hover:text-harmonic-primary transition-colors">{label}</p>
                    {description && <p className="text-xs text-harmonic-muted mt-0.5">{description}</p>}
                  </div>
                  <ChevronRight size={15} className="text-harmonic-muted group-hover:translate-x-0.5 group-hover:text-harmonic-primary transition-all" aria-hidden="true" />
                </Link>
              ))}
            </Card>
          </div>
        )}

        {/* Legal section */}
        <div className="mb-5 animate-fade-in-up delay-100">
          <p className="text-[11px] font-bold text-harmonic-muted uppercase tracking-widest mb-2.5 px-1">Legal</p>
          <Card className="divide-y divide-harmonic-border/60">
            {legalRows.map(({ to, label, icon: Icon, iconBg }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-harmonic-surface/40 transition-colors group"
              >
                <span className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <Icon size={16} className="text-white" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-harmonic-text group-hover:text-harmonic-primary transition-colors flex-1">{label}</span>
                <ChevronRight size={15} className="text-harmonic-muted group-hover:translate-x-0.5 group-hover:text-harmonic-primary transition-all" aria-hidden="true" />
              </Link>
            ))}
          </Card>
        </div>

        {/* Danger zone */}
        <div className="animate-fade-in-up delay-150">
          <p className="text-[11px] font-bold text-harmonic-muted uppercase tracking-widest mb-2.5 px-1">Account actions</p>
          <Card className="divide-y divide-harmonic-border/60">
            <button
              onClick={() => setSignOutOpen(true)}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-harmonic-surface/40 transition-colors text-left group"
            >
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-harmonic-muted to-gray-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <LogOut size={16} className="text-white" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-harmonic-text group-hover:text-harmonic-primary transition-colors flex-1">Sign out</span>
            </button>
            <Link
              to="/settings/delete"
              className="w-full flex items-center gap-3.5 px-4 py-3.5 hover:bg-harmonic-danger/5 transition-colors group"
            >
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-harmonic-danger to-rose-400 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Trash2 size={16} className="text-white" aria-hidden="true" />
              </span>
              <span className="text-sm font-semibold text-harmonic-danger flex-1">Delete account</span>
              <ChevronRight size={15} className="text-harmonic-muted group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
            </Link>
          </Card>
        </div>

        <p className="text-center text-xs text-harmonic-muted mt-8">
          Harmoniq · A <span className="font-semibold text-harmonic-secondary">SoulSPCE</span> project
        </p>
      </div>

      <Modal
        open={signOutOpen}
        onOpenChange={setSignOutOpen}
        title="Sign out?"
        description="You'll need to sign in again to access your choir."
        footer={
          <>
            <Button variant="outlined" onClick={() => setSignOutOpen(false)} disabled={signingOut}>Cancel</Button>
            <Button variant="inverted" onClick={handleSignOut} disabled={signingOut}>
              {signingOut ? 'Signing out…' : 'Sign out'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-harmonic-muted">See you next time.</p>
      </Modal>
    </AppLayout>
  )
}
