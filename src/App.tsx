import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Skeleton } from '@/components/ui/Skeleton'

// Auth — small, loaded immediately
import { SignIn } from '@/pages/auth/SignIn'

// Everything else — lazy loaded on first visit
const SignUp            = lazy(() => import('@/pages/auth/SignUp').then(m => ({ default: m.SignUp })))
const ForgotPassword    = lazy(() => import('@/pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })))
const VerifyEmail       = lazy(() => import('@/pages/auth/VerifyEmail').then(m => ({ default: m.VerifyEmail })))

const RoleSelection     = lazy(() => import('@/pages/onboarding/RoleSelection').then(m => ({ default: m.RoleSelection })))
const CreateOrJoinChoir = lazy(() => import('@/pages/onboarding/CreateOrJoinChoir').then(m => ({ default: m.CreateOrJoinChoir })))
const VoicePart         = lazy(() => import('@/pages/onboarding/VoicePart').then(m => ({ default: m.VoicePart })))

const Dashboard         = lazy(() => import('@/pages/dashboard/Dashboard').then(m => ({ default: m.Dashboard })))

const ServicesList      = lazy(() => import('@/pages/services/ServicesList').then(m => ({ default: m.ServicesList })))
const ServiceForm       = lazy(() => import('@/pages/services/ServiceForm').then(m => ({ default: m.ServiceForm })))
const SetListBuilder    = lazy(() => import('@/pages/services/SetListBuilder').then(m => ({ default: m.SetListBuilder })))
const SetListDetail     = lazy(() => import('@/pages/services/SetListDetail').then(m => ({ default: m.SetListDetail })))
const SongDetail        = lazy(() => import('@/pages/services/SongDetail').then(m => ({ default: m.SongDetail })))
const ServiceRoster     = lazy(() => import('@/pages/services/ServiceRoster').then(m => ({ default: m.ServiceRoster })))

const MarkAvailability  = lazy(() => import('@/pages/availability/MarkAvailability').then(m => ({ default: m.MarkAvailability })))
const AvailabilityOverview = lazy(() => import('@/pages/availability/AvailabilityOverview').then(m => ({ default: m.AvailabilityOverview })))

const MembersDirectory  = lazy(() => import('@/pages/members/MembersDirectory').then(m => ({ default: m.MembersDirectory })))
const MemberProfile     = lazy(() => import('@/pages/members/MemberProfile').then(m => ({ default: m.MemberProfile })))
const InviteMembers     = lazy(() => import('@/pages/members/InviteMembers').then(m => ({ default: m.InviteMembers })))
const VoicePartRequest  = lazy(() => import('@/pages/members/VoicePartRequest').then(m => ({ default: m.VoicePartRequest })))
const JoinChoir         = lazy(() => import('@/pages/JoinChoir').then(m => ({ default: m.JoinChoir })))

const SongLibrary       = lazy(() => import('@/pages/library/SongLibrary').then(m => ({ default: m.SongLibrary })))
const SongLibraryDetail = lazy(() => import('@/pages/library/SongLibraryDetail').then(m => ({ default: m.SongLibraryDetail })))
const AddCustomSong     = lazy(() => import('@/pages/library/AddCustomSong').then(m => ({ default: m.AddCustomSong })))

const AttendanceTracker = lazy(() => import('@/pages/attendance/AttendanceTracker').then(m => ({ default: m.AttendanceTracker })))
const MyAttendance      = lazy(() => import('@/pages/attendance/MyAttendance').then(m => ({ default: m.MyAttendance })))
const AnnouncementsFeed = lazy(() => import('@/pages/announcements/AnnouncementsFeed').then(m => ({ default: m.AnnouncementsFeed })))
const CreateAnnouncement = lazy(() => import('@/pages/announcements/CreateAnnouncement').then(m => ({ default: m.CreateAnnouncement })))
const NotificationCentre = lazy(() => import('@/pages/notifications/NotificationCentre').then(m => ({ default: m.NotificationCentre })))

const MessagesLayout    = lazy(() => import('@/pages/messages/MessagesLayout').then(m => ({ default: m.MessagesLayout })))
const ChannelView       = lazy(() => import('@/pages/messages/ChannelView').then(m => ({ default: m.ChannelView })))

const Settings          = lazy(() => import('@/pages/settings/Settings').then(m => ({ default: m.Settings })))
const MyProfile         = lazy(() => import('@/pages/settings/MyProfile').then(m => ({ default: m.MyProfile })))
const ChoirSettings     = lazy(() => import('@/pages/settings/ChoirSettings').then(m => ({ default: m.ChoirSettings })))
const NotificationSettings = lazy(() => import('@/pages/settings/NotificationSettings').then(m => ({ default: m.NotificationSettings })))
const DeleteAccount     = lazy(() => import('@/pages/settings/DeleteAccount').then(m => ({ default: m.DeleteAccount })))
const PrivacyPolicy     = lazy(() => import('@/pages/settings/LegalPage').then(m => ({ default: m.PrivacyPolicy })))
const TermsOfService    = lazy(() => import('@/pages/settings/LegalPage').then(m => ({ default: m.TermsOfService })))

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

// Wrap lazy routes so the full-screen loader shows during chunk fetch
function S({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<FullScreenLoader />}>{children}</Suspense>
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
      <Route
        path="/sign-up"
        element={
          firebaseUser && harmonicUser?.onboardingComplete
            ? <Navigate to="/dashboard" replace />
            : <S><SignUp /></S>
        }
      />
      <Route path="/forgot-password" element={<S><ForgotPassword /></S>} />
      <Route path="/verify-email" element={<S><VerifyEmail /></S>} />

      {/* Onboarding */}
      <Route path="/onboarding/role" element={<RequireAuth><S><RoleSelection /></S></RequireAuth>} />
      <Route path="/onboarding/choir" element={<RequireAuth><S><CreateOrJoinChoir /></S></RequireAuth>} />
      <Route path="/onboarding/voice-part" element={<RequireAuth><S><VoicePart /></S></RequireAuth>} />

      {/* App */}
      <Route path="/dashboard" element={<RequireAuth><RequireOnboarding><S><Dashboard /></S></RequireOnboarding></RequireAuth>} />

      <Route path="/services" element={<RequireAuth><RequireOnboarding><S><ServicesList /></S></RequireOnboarding></RequireAuth>} />
      <Route path="/services/new" element={<RequireAuth><RequireOnboarding><S><ServiceForm /></S></RequireOnboarding></RequireAuth>} />
      <Route path="/services/:serviceId/edit" element={<RequireAuth><RequireOnboarding><S><ServiceForm /></S></RequireOnboarding></RequireAuth>} />
      <Route path="/services/:serviceId/setlist" element={<RequireAuth><RequireOnboarding><S><SetListBuilder /></S></RequireOnboarding></RequireAuth>} />
      <Route path="/services/:serviceId/songs/:songId" element={<RequireAuth><RequireOnboarding><S><SongDetail /></S></RequireOnboarding></RequireAuth>} />
      <Route path="/services/:serviceId/availability" element={<RequireAuth><RequireOnboarding><S><MarkAvailability /></S></RequireOnboarding></RequireAuth>} />
      <Route path="/services/:serviceId/roster" element={<RequireAuth><RequireOnboarding><S><ServiceRoster /></S></RequireOnboarding></RequireAuth>} />
      <Route path="/services/:serviceId" element={<RequireAuth><RequireOnboarding><S><SetListDetail /></S></RequireOnboarding></RequireAuth>} />

      <Route path="/availability" element={<RequireAuth><RequireOnboarding><S><AvailabilityOverview /></S></RequireOnboarding></RequireAuth>} />

      <Route path="/library" element={<RequireAuth><RequireOnboarding><S><SongLibrary /></S></RequireOnboarding></RequireAuth>} />
      <Route path="/library/add" element={<RequireAuth><RequireOnboarding><S><AddCustomSong /></S></RequireOnboarding></RequireAuth>} />
      <Route path="/library/:songId" element={<RequireAuth><RequireOnboarding><S><SongLibraryDetail /></S></RequireOnboarding></RequireAuth>} />

      <Route path="/members" element={<RequireAuth><RequireOnboarding><S><MembersDirectory /></S></RequireOnboarding></RequireAuth>} />
      <Route path="/members/invite" element={<RequireAuth><RequireOnboarding><S><InviteMembers /></S></RequireOnboarding></RequireAuth>} />
      <Route path="/members/:uid" element={<RequireAuth><RequireOnboarding><S><MemberProfile /></S></RequireOnboarding></RequireAuth>} />

      <Route path="/announcements" element={<RequireAuth><RequireOnboarding><S><AnnouncementsFeed /></S></RequireOnboarding></RequireAuth>} />
      <Route path="/announcements/new" element={<RequireAuth><RequireOnboarding><S><CreateAnnouncement /></S></RequireOnboarding></RequireAuth>} />

      <Route path="/notifications" element={<RequireAuth><RequireOnboarding><S><NotificationCentre /></S></RequireOnboarding></RequireAuth>} />

      <Route path="/attendance" element={<RequireAuth><RequireOnboarding><S><AttendanceTracker /></S></RequireOnboarding></RequireAuth>} />
      <Route path="/my-attendance" element={<RequireAuth><RequireOnboarding><S><MyAttendance /></S></RequireOnboarding></RequireAuth>} />

      {/* Messages */}
      <Route
        path="/messages"
        element={<RequireAuth><RequireOnboarding><S><MessagesLayout /></S></RequireOnboarding></RequireAuth>}
      >
        <Route path=":channelId" element={<S><ChannelView /></S>} />
      </Route>

      <Route path="/settings" element={<RequireAuth><RequireOnboarding><S><Settings /></S></RequireOnboarding></RequireAuth>} />
      <Route path="/settings/choir" element={<RequireAuth><RequireOnboarding><S><ChoirSettings /></S></RequireOnboarding></RequireAuth>} />
      <Route path="/settings/notifications" element={<RequireAuth><RequireOnboarding><S><NotificationSettings /></S></RequireOnboarding></RequireAuth>} />
      <Route path="/settings/delete" element={<RequireAuth><RequireOnboarding><S><DeleteAccount /></S></RequireOnboarding></RequireAuth>} />

      <Route path="/join/:code" element={<S><JoinChoir /></S>} />

      <Route path="/profile" element={<RequireAuth><RequireOnboarding><S><MyProfile /></S></RequireOnboarding></RequireAuth>} />
      <Route path="/profile/voice-part" element={<RequireAuth><RequireOnboarding><S><VoicePartRequest /></S></RequireOnboarding></RequireAuth>} />

      <Route path="/privacy" element={<S><PrivacyPolicy /></S>} />
      <Route path="/terms" element={<S><TermsOfService /></S>} />

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

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
