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
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMoreOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* More drawer */}
      {moreOpen && (
        <div
          className="fixed bottom-20 left-4 right-4 bg-white/85 backdrop-blur-xl border border-white/70 rounded-card-lg shadow-glass z-40 p-4 md:hidden"
          role="dialog"
          aria-label="More navigation options"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-harmonic-text">More</span>
            <button
              onClick={() => setMoreOpen(false)}
              aria-label="Close menu"
              className="p-1 rounded-full hover:bg-harmonic-surface transition-colors"
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
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 to-rose-500 text-white shadow-md shadow-violet-500/20'
                      : 'text-harmonic-text hover:bg-white/60',
                  )
                }
              >
                <Icon size={18} aria-hidden="true" />
                <span className="flex-1">{label}</span>
                {to === '/notifications' && unreadCount > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-harmonic-secondary text-white text-[10px] font-semibold flex items-center justify-center">
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
        className="fixed bottom-0 left-0 right-0 bg-white/85 backdrop-blur-xl border-t border-white/60 shadow-lg shadow-black/5 z-30 md:hidden"
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
                  'flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-2xl transition-all',
                  isActive
                    ? 'bg-gradient-to-br from-violet-600 to-rose-500 text-white shadow-lg shadow-violet-500/30 scale-105'
                    : 'text-harmonic-muted hover:text-harmonic-primary hover:bg-violet-50',
                )
              }
            >
              <Icon size={20} aria-hidden="true" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </NavLink>
          ))}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(v => !v)}
            aria-label={unreadCount > 0 ? `More options, ${unreadCount} unread notifications` : 'More options'}
            aria-expanded={moreOpen}
            className={cn(
              'relative flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-2xl transition-all',
              moreOpen
                ? 'bg-gradient-to-br from-violet-600 to-rose-500 text-white shadow-lg shadow-violet-500/30 scale-105'
                : 'text-harmonic-muted hover:text-harmonic-primary hover:bg-violet-50',
            )}
          >
            <MoreHorizontal size={20} aria-hidden="true" />
            <span className="text-[10px] font-medium leading-none">More</span>
            {unreadCount > 0 && !moreOpen && (
              <span className="absolute top-1.5 right-2.5 w-2 h-2 rounded-full bg-harmonic-secondary" aria-hidden="true" />
            )}
          </button>
        </div>
      </nav>
    </>
  )
}
