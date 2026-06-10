import { type ReactNode } from 'react'
import { WifiOff } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

interface AppLayoutProps {
  children: ReactNode
  hidePadding?: boolean
}

export function AppLayout({ children, hidePadding }: AppLayoutProps) {
  const online = useOnlineStatus()

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-rose-50 relative">
      {/* Ambient background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-48 -left-48 w-[500px] h-[500px] bg-violet-400/15 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[400px] h-[400px] bg-rose-400/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[350px] h-[350px] bg-sky-400/10 rounded-full blur-3xl" />
      </div>

      {/* Skip to content — keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-harmonic-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-pill focus:text-sm"
      >
        Skip to content
      </a>

      <Sidebar />

      <main
        className={`md:ml-64 ${hidePadding ? '' : 'pb-20 md:pb-0'} min-h-screen relative z-10`}
        id="main-content"
      >
        {/* Offline banner */}
        {!online && (
          <div
            role="status"
            className="flex items-center gap-2 bg-amber-50/90 backdrop-blur-sm border-b border-amber-200 text-amber-700 px-4 py-2.5 text-sm font-medium justify-center"
          >
            <WifiOff size={16} aria-hidden="true" />
            You're offline. Your set list is still available but some features are paused.
          </div>
        )}
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
