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
  Zap,
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
      className="hidden md:flex flex-col w-64 min-h-screen bg-gradient-sidebar py-6 px-4 fixed left-0 top-0 z-20 border-r border-harmonic-borderDark"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-electric shadow-neon-border overflow-hidden">
            <div className="absolute inset-0 bg-gradient-electric opacity-80" />
            <Music2 size={17} className="text-white relative z-10 animate-float" aria-hidden="true" />
          </div>
          <div>
            <span className="block text-lg font-bold tracking-tight text-gradient-aurora">Harmoniq</span>
            <span className="block text-[10px] text-harmonic-onDarkMuted font-medium mt-0.5">A SoulSPCE project</span>
          </div>
        </div>
      </div>

      {/* Choir name chip */}
      <div className="mb-5 mx-2">
        <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2">
            <Zap size={11} className="text-harmonic-amber flex-shrink-0" />
            <span className="text-[11px] font-semibold text-harmonic-onDark truncate">Your Choir</span>
          </div>
        </div>
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
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-gradient-electric text-white shadow-sidebar-item'
                  : 'text-harmonic-onDarkMuted hover:text-harmonic-onDark hover:bg-white/8',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'relative flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-all duration-200',
                    isActive ? 'bg-white/20' : 'group-hover:bg-white/10',
                  )}
                >
                  <Icon
                    size={15}
                    aria-hidden="true"
                    className={cn(
                      'transition-transform duration-200',
                      isActive ? 'text-white' : 'text-harmonic-onDarkMuted group-hover:text-harmonic-neon',
                      isActive && 'scale-110',
                    )}
                  />
                  {badge && unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-harmonic-hot text-white text-[10px] font-bold flex items-center justify-center shadow-card-hot">
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

      {/* Bottom glow accent */}
      <div className="mt-4 px-2">
        <div className="h-px bg-gradient-electric opacity-30 rounded-full" />
        <p className="text-[10px] text-harmonic-onDarkMuted text-center mt-3 font-medium">
          Vocal excellence, coordinated.
        </p>
      </div>
    </aside>
  )
}
