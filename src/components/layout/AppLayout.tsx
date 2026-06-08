import { type ReactNode } from 'react'
import { WifiOff } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { PersistentAudioPlayer } from '@/components/PersistentAudioPlayer'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useAudioPlayerStore } from '@/store/audioPlayerStore'

interface AppLayoutProps {
  children: ReactNode
  hidePadding?: boolean
}

export function AppLayout({ children, hidePadding }: AppLayoutProps) {
  const online = useOnlineStatus()
  const playerActive = useAudioPlayerStore(s => s.track !== null)

  return (
    <div className="min-h-screen bg-harmonic-background">
      {/* Skip to content — keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-harmonic-electric focus:text-white focus:px-4 focus:py-2 focus:rounded-pill focus:text-sm"
      >
        Skip to content
      </a>

      <Sidebar />

      <main
        className={`md:ml-64 ${hidePadding ? '' : playerActive ? 'pb-36 md:pb-14' : 'pb-24 md:pb-0'} min-h-screen`}
        id="main-content"
      >
        {/* Offline banner */}
        {!online && (
          <div
            role="status"
            className="flex items-center gap-2 bg-harmonic-warningBg text-harmonic-warning px-4 py-2.5 text-sm font-semibold justify-center border-b border-harmonic-warning/20"
          >
            <WifiOff size={16} aria-hidden="true" />
            You're offline. Your set list is still available but some features are paused.
          </div>
        )}
        {children}
      </main>

      <PersistentAudioPlayer />
      <BottomNav />
    </div>
  )
}
