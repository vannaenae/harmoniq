// ── User & Auth ──────────────────────────────────────────────────────────────

export type UserRole = 'owner' | 'leader' | 'member';

export type VocalPart = 'soprano' | 'alto' | 'tenor' | 'bass' | 'instrumentalist' | 'unassigned';

export interface HarmoniqUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  vocalPart?: VocalPart;
  choirId?: string;
  choirIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Choir ─────────────────────────────────────────────────────────────────────

export interface Choir {
  id: string;
  name: string;
  churchName?: string;
  inviteCode: string;
  ownerId: string;
  defaultServiceDay?: string;
  defaultRehearsalDay?: string;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChoirMember {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  vocalPart: VocalPart;
  joinedAt: Date;
}

// ── Song ──────────────────────────────────────────────────────────────────────

export interface Song {
  id: string;
  choirId: string;
  title: string;
  artist?: string;
  version?: string;
  key?: string;
  tempo?: number;
  youtubeUrl?: string;
  spotifyUrl?: string;
  description?: string;
  lyrics?: string;
  rehearsalNotes?: string;
  audioUrl?: string;
  sheetMusicUrl?: string;
  tags?: string[];
  vocalParts?: VocalPartNote[];
  addedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VocalPartNote {
  part: VocalPart;
  notes?: string;
  audioUrl?: string;
}

// ── SetList ───────────────────────────────────────────────────────────────────

export type SetListStatus = 'draft' | 'published';

export interface SetList {
  id: string;
  choirId: string;
  title: string;
  serviceDate: Date;
  status: SetListStatus;
  notes?: string;
  songs: SetListSong[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SetListSong {
  songId: string;
  title: string;
  artist?: string;
  order: number;
  key?: string;
  notes?: string;
  duration?: number;
}

// ── Rehearsal / Event ─────────────────────────────────────────────────────────

export type EventType = 'rehearsal' | 'service' | 'other';

export interface RehearsalEvent {
  id: string;
  choirId: string;
  title: string;
  type: EventType;
  startTime: Date;
  endTime: Date;
  location?: string;
  notes?: string;
  setListId?: string;
  createdBy: string;
  createdAt: Date;
}

// ── Availability ──────────────────────────────────────────────────────────────

export type AvailabilityStatus = 'available' | 'unavailable' | 'maybe' | 'no_response';

export interface Availability {
  id: string;
  choirId: string;
  eventId: string;
  userId: string;
  status: AvailabilityStatus;
  note?: string;
  updatedAt: Date;
}

// ── Announcement ─────────────────────────────────────────────────────────────

export interface Announcement {
  id: string;
  choirId: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  pinned?: boolean;
}

// ── Invite ───────────────────────────────────────────────────────────────────

export type InviteStatus = 'pending' | 'accepted' | 'declined';

export interface Invite {
  id: string;
  choirId: string;
  choirName: string;
  email: string;
  role: UserRole;
  status: InviteStatus;
  createdAt: Date;
}
