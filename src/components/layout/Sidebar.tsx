import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Music2,
  Users,
  Megaphone,
  Bell,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/services',     label: 'Services',   icon: CalendarDays },
  { to: '/library',      label: 'Library',    icon: Music2 },
  { to: '/members',      label: 'Members',    icon: Users },
  { to: '/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings',     label: 'Settings',   icon: Settings },
]

export function Sidebar() {
  return (
    <aside
      className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-harmonic-border py-6 px-4 fixed left-0 top-0 z-20"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="mb-8 px-2">
        <span className="text-xl font-bold text-harmonic-primary tracking-tight">Harmonic</span>
        <span className="block text-xs text-harmonic-muted font-medium mt-0.5">A SoulSPCE project</span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-harmonic-neutral text-white'
                  : 'text-harmonic-muted hover:text-harmonic-text hover:bg-harmonic-surface',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0',
                    isActive ? 'bg-white/10' : '',
                  )}
                >
                  <Icon
                    size={18}
                    aria-hidden="true"
                    className={isActive ? 'text-white' : 'text-harmonic-muted'}
                  />
                </span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
