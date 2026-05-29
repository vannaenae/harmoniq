import { type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-harmonic-background">
      <Sidebar />

      {/* Main content — offset for sidebar on desktop */}
      <main
        className="md:ml-64 pb-20 md:pb-0 min-h-screen"
        id="main-content"
      >
        {children}
      </main>

      <BottomNav />
    </div>
  )
}
