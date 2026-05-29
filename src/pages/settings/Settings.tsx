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
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'

export function Settings() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { isDirector } = useChoir()
  const [signOutOpen, setSignOutOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    await signOut()
    navigate('/sign-in', { replace: true })
  }

  const rows = [
    { to: '/profile', label: 'My profile', icon: User, show: true },
    { to: '/settings/choir', label: 'Choir settings', icon: Music4, show: isDirector },
    { to: '/settings/notifications', label: 'Notification settings', icon: Bell, show: true },
    { to: '/privacy', label: 'Privacy policy', icon: Shield, show: true },
    { to: '/terms', label: 'Terms of service', icon: FileText, show: true },
  ].filter(r => r.show)

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        <PageHeader title="Settings" />

        <Card className="divide-y divide-harmonic-border mb-5">
          {rows.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center gap-3 px-4 py-3.5 hover:bg-harmonic-surface/50 transition-colors">
              <span className="w-9 h-9 rounded-full bg-harmonic-surface flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-harmonic-primary" aria-hidden="true" />
              </span>
              <span className="text-sm text-harmonic-text flex-1">{label}</span>
              <ChevronRight size={16} className="text-harmonic-muted" aria-hidden="true" />
            </Link>
          ))}
        </Card>

        {/* Account actions */}
        <Card className="divide-y divide-harmonic-border">
          <button
            onClick={() => setSignOutOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-harmonic-surface/50 transition-colors text-left"
          >
            <span className="w-9 h-9 rounded-full bg-harmonic-surface flex items-center justify-center flex-shrink-0">
              <LogOut size={16} className="text-harmonic-text" aria-hidden="true" />
            </span>
            <span className="text-sm text-harmonic-text flex-1">Sign out</span>
          </button>
          <Link to="/settings/delete" className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-harmonic-surface/50 transition-colors">
            <span className="w-9 h-9 rounded-full bg-harmonic-danger/10 flex items-center justify-center flex-shrink-0">
              <Trash2 size={16} className="text-harmonic-danger" aria-hidden="true" />
            </span>
            <span className="text-sm text-harmonic-danger flex-1">Delete account</span>
            <ChevronRight size={16} className="text-harmonic-muted" aria-hidden="true" />
          </Link>
        </Card>

        <p className="text-center text-xs text-harmonic-muted mt-8">
          Harmoniq · A <span className="font-semibold" style={{ color: '#560056' }}>SoulSPCE</span> project
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
        <p className="text-sm text-harmonic-muted">See you next time. 👋</p>
      </Modal>
    </AppLayout>
  )
}
