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

export interface ChoirLicensing {
  ccliNumber?: string
  attested: boolean
  attestedBy?: string
  attestedAt?: Date
}

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
  licensing?: ChoirLicensing
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
  canLead?: boolean
  joinedAt: Date
}

// ── Song (rev-2 schema) ──────────────────────────────────────────────────────

export type Language = 'en' | 'yo' | 'ig' | 'ha' | 'pcm' | 'fr' | 'sw' | 'pt' | 'la' | 'other'
export type TimeSig = '4/4' | '3/4' | '6/8' | '2/4' | '12/8' | '5/4' | 'other'
export type RightsStatus = 'public_domain' | 'ccli_required' | 'royalty_free' | 'unlicensed' | 'unknown'
export type SongOrigin = 'seed' | 'global' | 'custom'

export type SongGenre =
  | 'Hymn' | 'Contemporary' | 'Gospel' | 'African Gospel'
  | 'Yoruba' | 'Igbo' | 'Hausa' | 'Pidgin'
  | 'Anthem' | 'Chorale' | 'Spiritual' | 'Modern' | 'Other'

export interface LyricSection {
  kind: 'verse' | 'chorus' | 'pre_chorus' | 'bridge' | 'tag' | 'refrain' | 'intro' | 'outro' | 'interlude'
  number?: number
  lines: string[]
  chordsAboveLines?: string[]
  language: Language
}

export interface SongTranslation {
  language: Language
  sections: LyricSection[]
  translator: 'human' | 'ai'
  aiModel?: string
  reviewedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface SatbPart {
  voice: 'soprano' | 'alto' | 'tenor' | 'bass'
  audioUrl?: string
  pdfUrl?: string
  notes?: string
}

export interface SongMediaLinks {
  youtubeVideoId?: string
  youtubeOfficialAudioId?: string
  spotifyTrackId?: string
  spotifyAlbumId?: string
  appleMusicUrl?: string
  audioMackUrl?: string
  boomplayUrl?: string
}

export interface SongRights {
  status: RightsStatus
  ccliNumber?: string
  publisher?: string
  copyrightYear?: number
  rightsHolders?: string[]
  notes?: string
}

export interface SongMeta {
  bpm?: number
  timeSig?: TimeSig
  durationSec?: number
  scriptureRefs?: string[]
  themes?: string[]
  occasions?: string[]
  liturgicalSeason?: 'advent' | 'christmas' | 'lent' | 'easter' | 'pentecost' | 'ordinary'
}

export interface Song {
  id: string
  origin: SongOrigin
  title: string
  alternateTitles?: string[]
  artist?: string
  composers?: string[]
  arrangers?: string[]
  primaryLanguage: Language
  availableLanguages: Language[]
  genre?: SongGenre
  defaultKey?: string
  capoHint?: number
  meta: SongMeta
  rights: SongRights
  media: SongMediaLinks
  lyrics: LyricSection[]
  translations?: SongTranslation[]
  chordChartUrl?: string
  sheetMusicUrl?: string
  leadSheetUrl?: string
  satbParts?: SatbPart[]
  archived?: boolean
  tags?: string[]
  albumArtUrl?: string
  choirId?: string
  addedBy: string
  createdAt: Date
  updatedAt: Date

  // ── Transitional compat fields (removed when 25.2+ consumers ship) ──
  /** @deprecated Use `origin === 'custom'` instead */
  isCustom?: boolean
  /** @deprecated Use `media.spotifyTrackId` instead */
  spotifyTrackId?: string
  /** @deprecated Removed */
  spotifyPreviewUrl?: string
  /** @deprecated Use lyrics[] sections */
  geniusUrl?: string
  /** @deprecated Use lyrics[] sections */
  lyricsUrl?: string
  /** @deprecated Use SongOverride.rehearsalNotes or meta */
  notes?: string
}

// ── Song Overrides (per-choir) ───────────────────────────────────────────────

export interface SongOverride {
  songId: string
  choirId: string
  performanceKey?: string
  keyLocked?: boolean
  rehearsalNotes?: string
  capoHint?: number
  archived?: boolean
  preferredLanguage?: Language
  updatedBy: string
  updatedAt: Date
}

// ── Offline save marker ──────────────────────────────────────────────────────

export interface OfflineSongMarker {
  songId: string
  savedAt: Date
  lastSyncedAt: Date
}

// ── Translation cache ────────────────────────────────────────────────────────

export interface SongTranslationCache {
  songId: string
  language: Language
  sections: LyricSection[]
  translator: 'human' | 'ai'
  aiModel?: string
  reviewedBy?: string
  createdAt: Date
  updatedAt: Date
}

// ── Service / Set List ────────────────────────────────────────────────────────

export type ServiceStatus = 'draft' | 'published'

export type ServiceType =
  | 'first_worship' | 'second_worship' | 'offering_hymn'
  | 'thanksgiving' | 'communion' | 'evening_service'
  | 'special_service' | 'rehearsal' | 'other'

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  first_worship:    'First Worship',
  second_worship:   'Second Worship',
  offering_hymn:    'Offering Hymn',
  thanksgiving:     'Thanksgiving',
  communion:        'Communion',
  evening_service:  'Evening Service',
  special_service:  'Special Service',
  rehearsal:        'Rehearsal',
  other:            'Other',
}

export interface Service {
  id: string
  choirId: string
  title: string
  serviceType?: ServiceType
  date: Date
  time?: string
  location?: string
  theme?: string
  notes?: string
  scriptureRef?: string
  status: ServiceStatus
  availabilityDeadline?: Date
  setListDeadline?: Date
  rosteredMemberIds?: string[]
  calendarEventId?: string
  calendarLink?: string
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

// ── Messaging ─────────────────────────────────────────────────────────────────

export type ChannelVisibility = 'all' | 'vocalists' | 'instrumentalists' | 'directors'

export interface Channel {
  id: string
  choirId: string
  name: string
  description?: string
  category: 'general' | 'sections' | 'planning' | 'announcements'
  visibleTo: ChannelVisibility
  directorOnly: boolean
  order: number
  createdBy: string
  createdAt: Date
  lastMessageAt?: Date
  lastMessagePreview?: string
}

export interface Message {
  id: string
  channelId: string
  text: string
  authorId: string
  authorName: string
  authorPhotoUrl?: string
  createdAt: Date
  editedAt?: Date
  pinned: boolean
  reactions: Record<string, string[]>
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

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'unavailable'

export interface AttendanceRecord {
  id: string
  choirId: string
  serviceId: string
  userId: string
  status: AttendanceStatus
  updatedBy: string
  updatedAt: Date
}
