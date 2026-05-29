// ── Auth & User ───────────────────────────────────────────────────────────────

export type UserRole = 'director' | 'member'

export type VoicePart =
  | 'soprano' | 'alto' | 'tenor' | 'bass' | 'unclassified'
  | 'keys' | 'guitar' | 'bass_guitar' | 'drums' | 'other_instrument'

export interface NotificationPrefs {
  serviceUpdates: boolean
  availabilityReminders: boolean
  announcements: boolean
  system: boolean
  reminderTiming: '48h' | '24h'
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  serviceUpdates: true,
  availabilityReminders: true,
  announcements: true,
  system: true,
  reminderTiming: '24h',
}

export interface HarmonicUser {
  uid: string
  email: string
  displayName: string
  preferredName?: string
  photoURL?: string
  role?: UserRole
  voicePart?: VoicePart
  choirId?: string
  onboardingComplete: boolean
  notificationPrefs?: NotificationPrefs
  createdAt: Date
  updatedAt: Date
}

// ── Choir ─────────────────────────────────────────────────────────────────────

export interface Choir {
  id: string
  name: string
  churchName?: string
  logoURL?: string
  description?: string
  inviteCode: string
  inviteExpiry: Date
  ownerId: string
  memberCount: number
  createdAt: Date
  updatedAt: Date
}

export interface ChoirMember {
  uid: string
  displayName: string
  preferredName?: string
  email: string
  photoURL?: string
  role: UserRole
  voicePart: VoicePart
  joinedAt: Date
}

// ── Song ──────────────────────────────────────────────────────────────────────

export type SongGenre = 'Gospel' | 'Contemporary' | 'Hymn' | 'Modern' | 'Anthem' | 'Other'

export interface Song {
  id: string
  title: string
  artist?: string
  genre?: SongGenre
  defaultKey?: string
  spotifyTrackId?: string    /* API_POINT: Spotify — cached track ID */
  spotifyPreviewUrl?: string /* API_POINT: Spotify — 30s preview */
  albumArtUrl?: string       /* API_POINT: Spotify — artwork */
  geniusUrl?: string         /* API_POINT: Genius — lyrics page URL */
  lyricsUrl?: string
  notes?: string
  sheetMusicUrl?: string      // chord chart PDF (Firebase Storage)
  isCustom: boolean
  choirId?: string           // set for choir-private custom songs
  addedBy: string
  createdAt: Date
  updatedAt: Date
}

// ── Service / Set List ────────────────────────────────────────────────────────

export type ServiceStatus = 'draft' | 'published'

export interface Service {
  id: string
  choirId: string
  title: string
  date: Date
  time?: string
  theme?: string
  scriptureRef?: string
  status: ServiceStatus
  calendarEventId?: string   /* API_POINT: Google Calendar — event ID */
  calendarLink?: string      /* API_POINT: Google Calendar — shareable link */
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface SetListItem {
  songId: string
  title: string
  artist?: string
  albumArtUrl?: string
  key?: string
  leadVocalist?: string
  notes?: string
  order: number
}

// ── Availability ──────────────────────────────────────────────────────────────

export type AvailabilityStatus = 'available' | 'unavailable' | 'not_sure' | 'no_response'

export interface Availability {
  id: string
  choirId: string
  serviceId: string
  userId: string
  status: AvailabilityStatus
  note?: string
  updatedAt: Date
}

// ── Announcement ─────────────────────────────────────────────────────────────

export interface Announcement {
  id: string
  choirId: string
  title: string
  body: string
  pinned: boolean
  targetVoiceParts?: VoicePart[]
  authorId: string
  authorName: string
  createdAt: Date
  updatedAt: Date
}

// ── Notification ─────────────────────────────────────────────────────────────

export type NotificationCategory = 'service_update' | 'availability_reminder' | 'announcement' | 'system'

export interface AppNotification {
  id: string
  userId: string
  category: NotificationCategory
  title: string
  body: string
  read: boolean
  deepLink?: string
  createdAt: Date
}

// ── Attendance ────────────────────────────────────────────────────────────────

export type AttendanceStatus = 'present' | 'absent' | 'unavailable'

export interface AttendanceRecord {
  id: string
  choirId: string
  serviceId: string
  userId: string
  status: AttendanceStatus
  updatedBy: string
  updatedAt: Date
}
