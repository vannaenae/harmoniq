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

// Services & set lists (Phase 2)
import { ServicesList } from '@/pages/services/ServicesList'
import { ServiceForm } from '@/pages/services/ServiceForm'
import { SetListBuilder } from '@/pages/services/SetListBuilder'
import { SetListDetail } from '@/pages/services/SetListDetail'
import { SongDetail } from '@/pages/services/SongDetail'

// Availability & members (Phase 3)
import { MarkAvailability } from '@/pages/availability/MarkAvailability'
import { AvailabilityOverview } from '@/pages/availability/AvailabilityOverview'
import { MembersDirectory } from '@/pages/members/MembersDirectory'
import { MemberProfile } from '@/pages/members/MemberProfile'
import { InviteMembers } from '@/pages/members/InviteMembers'
import { VoicePartRequest } from '@/pages/members/VoicePartRequest'
import { JoinChoir } from '@/pages/JoinChoir'

// Song library (Phase 4)
import { SongLibrary } from '@/pages/library/SongLibrary'
import { SongLibraryDetail } from '@/pages/library/SongLibraryDetail'
import { AddCustomSong } from '@/pages/library/AddCustomSong'

// Attendance, announcements, notifications (Phase 5)
import { AttendanceTracker } from '@/pages/attendance/AttendanceTracker'
import { MyAttendance } from '@/pages/attendance/MyAttendance'
import { AnnouncementsFeed } from '@/pages/announcements/AnnouncementsFeed'
import { CreateAnnouncement } from '@/pages/announcements/CreateAnnouncement'
import { NotificationCentre } from '@/pages/notifications/NotificationCentre'

// Stub pages (Phase 6+)
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
        path="/services"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <ServicesList />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/services/new"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <ServiceForm />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/services/:serviceId/edit"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <ServiceForm />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/services/:serviceId/setlist"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <SetListBuilder />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/services/:serviceId/songs/:songId"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <SongDetail />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/services/:serviceId/availability"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <MarkAvailability />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/availability"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <AvailabilityOverview />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/services/:serviceId"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <SetListDetail />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/library"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <SongLibrary />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/library/add"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <AddCustomSong />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/library/:songId"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <SongLibraryDetail />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/members"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <MembersDirectory />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/members/invite"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <InviteMembers />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/members/:uid"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <MemberProfile />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/announcements"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <AnnouncementsFeed />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/announcements/new"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <CreateAnnouncement />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/notifications"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <NotificationCentre />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/attendance"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <AttendanceTracker />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/my-attendance"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <MyAttendance />
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

      {/* Invite link entry point */}
      <Route path="/join/:code" element={<JoinChoir />} />

      {/* Profile (Phase 6 builds the full screen; voice-part request is live now) */}
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <StubPage title="My Profile" description="Your profile and preferences. Coming in the next phase." />
            </RequireOnboarding>
          </RequireAuth>
        }
      />
      <Route
        path="/profile/voice-part"
        element={
          <RequireAuth>
            <RequireOnboarding>
              <VoicePartRequest />
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
