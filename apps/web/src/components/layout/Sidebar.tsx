import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Music2,
  Users,
  MessageSquare,
  Megaphone,
  Bell,
  Settings,
} from 'lucide-react'
import { cn } from '@harmoniq/shared'
import { useChoir } from '@harmoniq/shared'

const navItems = [
  { to: '/dashboard',     label: 'Dashboard',      icon: LayoutDashboard },
  { to: '/services',      label: 'Services',        icon: CalendarDays },
  { to: '/library',       label: 'Song Library',    icon: Music2 },
  { to: '/members',       label: 'Members',         icon: Users },
  { to: '/messages',      label: 'Messages',        icon: MessageSquare },
  { to: '/announcements', label: 'Announcements',   icon: Megaphone },
  { to: '/notifications', label: 'Notifications',   icon: Bell, badge: true },
  { to: '/settings',      label: 'Settings',        icon: Settings },
]

export function Sidebar() {
  const { unreadCount } = useChoir()

  return (
    <aside
      className="hidden md:flex flex-col w-64 min-h-screen bg-white/70 backdrop-blur-2xl border-r border-black/[0.07] py-6 px-3 fixed left-0 top-0 z-20"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="mb-8 px-3">
        <span className="text-xl font-bold text-harmonic-text tracking-tight">Harmoniq</span>
        <span className="block text-xs text-harmonic-muted font-medium mt-0.5">A SoulSPCE project</span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {navItems.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={badge && unreadCount > 0 ? `${label}, ${unreadCount} unread` : label}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors duration-150',
                isActive
                  ? 'bg-harmonic-primary/10 text-harmonic-primary font-semibold'
                  : 'text-harmonic-text/80 font-medium hover:bg-black/[0.04]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="relative flex items-center justify-center w-7 h-7 flex-shrink-0">
                  <Icon
                    size={19}
                    aria-hidden="true"
                    className={cn(
                      'transition-colors duration-150',
                      isActive ? 'text-harmonic-primary' : 'text-harmonic-muted',
                    )}
                  />
                  {badge && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-harmonic-danger text-white text-[10px] font-semibold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
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
