import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Skeleton } from '@/components/ui/Skeleton'

// Auth
import { SignIn } from '@/pages/auth/SignIn'

// Onboarding
import { RoleSelection } from '@/pages/onboarding/RoleSelection'
import { CreateOrJoinChoir } from '@/pages/onboarding/CreateOrJoinChoir'
import { VoicePart } from '@/pages/onboarding/VoicePart'

// Dashboard
import { Dashboard } from '@/pages/dashboard/Dashboard'

// Stub pages (Phase 2+)
import { StubPage } from '@/pages/StubPage'

/** Route guard — redirects unauthenticated users to sign-in */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!firebaseUser) return <Navigate to="/sign-in" replace />
  return <>{children}</>
}

/** Route guard — redirects to onboarding if not complete */
function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { harmonicUser, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (!harmonicUser?.onboardingComplete) {
    if (!harmonicUser?.role) return <Navigate to="/onboarding/role" replace />
    if (!harmonicUser?.choirId) return <Navigate to="/onboarding/choir" replace />
    if (harmonicUser?.role === 'member' && harmonicUser?.voicePart === undefined)
      return <Navigate to="/onboarding/voice-part" replace />
  }
  return <>{children}</>
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-harmonic-background flex items-center justify-center" aria-label="Loading">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl animate-pulse"
          style={{ background: 'linear-gradient(135deg, #18005F 0%, #560056 100%)' }}
          aria-hidden="true"
        />
        <div className="flex gap-1">
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="w-2 h-2 rounded-full" style={{ animationDelay: '0.15s' }} />
          <Skeleton className="w-2 h-2 rounded-full" style={{ animationDelay: '0.3s' }} />
        </div>
      </div>
    </div>
  )
}

export function App() {
  const { firebaseUser, harmonicUser, loading } = useAuth()

  if (loading) return <FullScreenLoader />

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/sign-in"
        element={
          firebaseUser && harmonicUser?.onboardingComplete
            ? <Navigate to="/dashboard" replace />
            : <SignIn />
        }
      />

      {/* Onboarding */}
      <Route
        path="/onboarding/role"
        element={
          <RequireAuth>
            <RoleSelection />
          </RequireAuth>
        }
      />
      <Route
        path="/onboarding/choir"
        element={
          <RequireAuth>
            <CreateOrJoinChoir />
          </RequireAuth>
        }
      />
      <Route
        path="/onboarding/voice-part"
        element={
          <RequireAuth>
            <VoicePart />
          </RequireAuth>
        }
      />

      {/* App — all require auth + completed onboarding */}
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <Dashboard />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/services/*"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <StubPage title="Services" description="Your set lists and service schedule will live here." />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/library/*"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <StubPage title="Song Library" description="Browse, search, and add songs to your choir's library." />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/members/*"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <StubPage title="Members" description="Your choir members and voice parts." />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/announcements/*"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <StubPage title="Announcements" description="Messages from your director." />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/notifications"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <StubPage title="Notifications" description="Service updates, availability reminders, and more." />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/settings/*"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <StubPage title="Settings" description="Profile, choir settings, and preferences." />
            </RequireOnboarding>
          </RequireAuth>
        }
      />

      {/* Static */}
      <Route path="/privacy" element={<StubPage title="Privacy Policy" />} />
      <Route path="/terms" element={<StubPage title="Terms of Service" />} />

      {/* Root redirect */}
      <Route
        path="/"
        element={
          !firebaseUser
            ? <Navigate to="/sign-in" replace />
            : !harmonicUser?.onboardingComplete
            ? <Navigate to="/onboarding/role" replace />
            : <Navigate to="/dashboard" replace />
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
