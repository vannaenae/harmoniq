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
  spotifyTrackId?: string
  spotifyPreviewUrl?: string
  albumArtUrl?: string
  geniusUrl?: string
  lyricsUrl?: string
  notes?: string
  sheetMusicUrl?: string
  ccliNumber?: number
  isCustom: boolean
  choirId?: string
  addedBy: string
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
  theme?: string
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

export interface MessageAttachment {
  url: string
  name: string
  contentType: string
  size: number
  /** Pixel dimensions, set for images so the UI can reserve layout space */
  width?: number
  height?: number
}

/** Snapshot of the message being replied to (WhatsApp-style quote) */
export interface ReplyPreview {
  messageId: string
  authorName: string
  text: string
  hasAttachment?: boolean
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
  attachments: MessageAttachment[]
  replyTo?: ReplyPreview
  /** Set on messages that live inside a thread; points at the root message */
  parentId?: string
  /** Number of thread replies (maintained on root messages) */
  threadCount: number
  threadLastReplyAt?: Date
}

export interface TypingUser {
  uid: string
  name: string
  at: number
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
