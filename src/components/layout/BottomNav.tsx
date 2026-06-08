import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Music2,
  MessageSquare,
  MoreHorizontal,
  Users,
  Megaphone,
  Bell,
  Settings,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChoir } from '@/contexts/ChoirContext'

const primaryItems = [
  { to: '/dashboard', label: 'Home',     icon: LayoutDashboard },
  { to: '/services',  label: 'Services', icon: CalendarDays },
  { to: '/messages',  label: 'Messages', icon: MessageSquare },
  { to: '/library',   label: 'Library',  icon: Music2 },
]

const moreItems = [
  { to: '/members',       label: 'Members',       icon: Users },
  { to: '/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings',      label: 'Settings',      icon: Settings },
]

export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false)
  const { unreadCount } = useChoir()

  return (
    <>
      {/* More drawer overlay */}
      {moreOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMoreOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* More drawer */}
      {moreOpen && (
        <div
          className="fixed bottom-[76px] left-3 right-3 bg-harmonic-sidebarAlt/95 backdrop-blur-xl rounded-card-lg border border-harmonic-borderDark z-40 p-4 md:hidden animate-slide-up-bounce shadow-card-neon"
          role="dialog"
          aria-label="More navigation options"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-harmonic-onDark tracking-tight">More</span>
            <button
              onClick={() => setMoreOpen(false)}
              aria-label="Close menu"
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/15 transition-colors"
            >
              <X size={14} className="text-harmonic-onDarkMuted" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {moreItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMoreOpen(false)}
                aria-label={to === '/notifications' && unreadCount > 0 ? `${label}, ${unreadCount} unread` : label}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-gradient-electric text-white shadow-btn-electric'
                      : 'text-harmonic-onDarkMuted hover:text-harmonic-onDark bg-white/5 hover:bg-white/10',
                  )
                }
              >
                <Icon size={16} aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {to === '/notifications' && unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-harmonic-hot text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 md:hidden"
        aria-label="Mobile navigation"
      >
        {/* Frosted glass pill nav */}
        <div className="mx-3 mb-3 bg-harmonic-sidebarAlt/90 backdrop-blur-xl border border-harmonic-borderDark rounded-card-lg shadow-card-neon">
          <div className="flex items-center justify-around h-[60px] px-2">
            {primaryItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                aria-label={label}
                className={({ isActive }) =>
                  cn(
                    'relative flex flex-col items-center justify-center gap-0.5 w-14 h-11 rounded-xl transition-all duration-200',
                    isActive
                      ? 'text-white'
                      : 'text-harmonic-onDarkMuted hover:text-harmonic-neon',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute inset-0 rounded-xl bg-gradient-electric opacity-90 shadow-btn-electric animate-pop-in" />
                    )}
                    <Icon size={18} aria-hidden="true" className="relative z-10" />
                    <span className="text-[9px] font-bold leading-none tracking-wide relative z-10">{label}</span>
                  </>
                )}
              </NavLink>
            ))}

            {/* More button */}
            <button
              onClick={() => setMoreOpen(v => !v)}
              aria-label={unreadCount > 0 ? `More options, ${unreadCount} unread notifications` : 'More options'}
              aria-expanded={moreOpen}
              className={cn(
                'relative flex flex-col items-center justify-center gap-0.5 w-14 h-11 rounded-xl transition-all duration-200',
                moreOpen
                  ? 'text-white'
                  : 'text-harmonic-onDarkMuted hover:text-harmonic-neon',
              )}
            >
              {moreOpen && (
                <span className="absolute inset-0 rounded-xl bg-gradient-electric opacity-90 shadow-btn-electric" />
              )}
              <MoreHorizontal size={18} aria-hidden="true" className="relative z-10" />
              <span className="text-[9px] font-bold leading-none tracking-wide relative z-10">More</span>
              {unreadCount > 0 && !moreOpen && (
                <span className="absolute top-1 right-2 w-2.5 h-2.5 rounded-full bg-harmonic-hot animate-glow-pulse" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
