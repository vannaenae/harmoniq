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
import { cn } from '@harmoniq/shared'
import { useChoir } from '@harmoniq/shared'

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
          className="fixed inset-0 bg-black/25 z-30 md:hidden animate-fade-in"
          onClick={() => setMoreOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* More drawer */}
      {moreOpen && (
        <div
          className="fixed bottom-20 left-4 right-4 bg-white/95 backdrop-blur-2xl border border-black/[0.06] rounded-card-lg shadow-pop z-40 p-4 md:hidden animate-slide-up"
          role="dialog"
          aria-label="More navigation options"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-harmonic-text">More</span>
            <button
              onClick={() => setMoreOpen(false)}
              aria-label="Close menu"
              className="p-1 rounded-full hover:bg-harmonic-surface transition-colors duration-150"
            >
              <X size={18} className="text-harmonic-muted" />
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {moreItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMoreOpen(false)}
                aria-label={to === '/notifications' && unreadCount > 0 ? `${label}, ${unreadCount} unread` : label}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150',
                    isActive
                      ? 'bg-harmonic-primary/10 text-harmonic-primary'
                      : 'text-harmonic-text hover:bg-harmonic-surface',
                  )
                }
              >
                <Icon size={18} aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {to === '/notifications' && unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-harmonic-danger text-white text-[10px] font-semibold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Bottom bar — iOS-style frosted tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-black/[0.07] z-30 md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {primaryItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              aria-label={label}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 w-14 h-12 transition-all duration-200 ease-out active:scale-90',
                  isActive ? 'text-harmonic-primary' : 'text-harmonic-muted hover:text-harmonic-text',
                )
              }
            >
              <Icon size={22} aria-hidden="true" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </NavLink>
          ))}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(v => !v)}
            aria-label={unreadCount > 0 ? `More options, ${unreadCount} unread notifications` : 'More options'}
            aria-expanded={moreOpen}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1 w-14 h-12 transition-all duration-200 ease-out active:scale-90',
              moreOpen ? 'text-harmonic-primary' : 'text-harmonic-muted hover:text-harmonic-text',
            )}
          >
            <MoreHorizontal size={22} aria-hidden="true" />
            <span className="text-[10px] font-medium leading-none">More</span>
            {unreadCount > 0 && !moreOpen && (
              <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-harmonic-danger" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>
    </>
  )
}
