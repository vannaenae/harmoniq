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
import { cn } from '@/lib/utils'
import { useChoir } from '@/contexts/ChoirContext'

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
      className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-harmonic-border/60 py-6 px-4 fixed left-0 top-0 z-20"
      aria-label="Main navigation"
    >
      {/* Logo — gradient brand block */}
      <div className="mb-8 px-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center flex-shrink-0 shadow-nav-active">
            <Music2 size={16} className="text-white" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gradient">Harmoniq</span>
        </div>
        <span className="block text-xs text-harmonic-muted font-medium mt-1.5 pl-[42px]">A SoulSPCE project</span>
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
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-brand text-white shadow-nav-active'
                  : 'text-harmonic-muted hover:text-harmonic-text hover:bg-harmonic-surface',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'relative flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0',
                    isActive ? 'bg-white/15' : '',
                  )}
                >
                  <Icon
                    size={16}
                    aria-hidden="true"
                    className={isActive ? 'text-white' : 'text-harmonic-muted'}
                  />
                  {badge && unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-harmonic-magenta text-white text-[10px] font-semibold flex items-center justify-center">
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
