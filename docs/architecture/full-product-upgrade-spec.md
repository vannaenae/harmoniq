# Full Product Upgrade Spec — Technical Architecture (HARA-26)

**Author:** CTO · **Date:** 2026-06-01 · **Parent:** HARA-22 (Master Strategic Brief)

This spec is the engineering source of truth for the 8 upgrade modules. It is grounded in the **live stack** (React 19 + Vite + Tailwind, Firebase Auth/Firestore/Storage, Cloud Functions in `functions/`, Vercel deploy) and the **existing data model** in `firestore.rules`. Treat any prior doc that references Expo/React Native as stale.

## Conventions (apply to every module)

- **Multi-tenant root:** `choirs/{choirId}` is the tenancy boundary. New collections nest under it unless the data is genuinely global (e.g. `songs/`).
- **IDs:** Firestore auto-IDs except where deterministic IDs aid security (e.g. `practiceNotes/{uid}_{songId}`, `attendance/{uid}`).
- **Timestamps:** `createdAt`, `updatedAt`, `createdBy` on every doc. Use `serverTimestamp()`.
- **Real-time:** Any list view that informs a coordination decision uses `onSnapshot`. Reports/analytics use one-shot reads + cache.
- **Role gate:** `getUserData().role` in (`director`, `leader`, `member`). Director ≈ owner; leader gets admin-scoped writes; member is read + own-doc write.
- **Cloud Function shape:** HTTPS callable for writes that need server-side validation or third-party calls; Firestore triggers for fan-out (denormalisation, notifications, counters).
- **Indexes:** Every composite query in this spec implies a `firestore.indexes.json` entry — bundle them per module.
- **Screens:** Routed via existing `src/pages/<area>/` convention; each screen reuses primitives from `src/components/ui`.
- **Verification gate:** `npx tsc --noEmit -p tsconfig.app.json` clean before any push. Playwright happy-path per new screen.

---

## A) Choir Core — Profiles, Attendance + SMS Reminders, Absence Patterns, Section Leads, Director View

**Goal:** Make the director's roster the single source of truth — who's in, who's reliable, who runs each section, who to nudge.

### Data model (TypeScript)

```ts
// choirs/{choirId}/members/{uid} — extends current member doc
interface ChoirMember {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;            // E.164, required to opt into SMS
  smsOptIn: boolean;         // default false
  voicePart: 'soprano'|'alto'|'tenor'|'bass'|'unclassified'
           | 'keys'|'guitar'|'bass_guitar'|'drums'|'other_instrument';
  role: 'director'|'leader'|'member';
  sectionLeadOf?: ChoirMember['voicePart']; // director assigns; leader for that part
  joinedAt: Timestamp;
  // Denormalised health (written by trigger, read by director view)
  attendanceRate30d?: number;     // 0..1
  attendanceRate90d?: number;
  lastAttendedAt?: Timestamp;
  absencePattern?: 'reliable'|'declining'|'flaky'|'new'; // derived
  consecutiveAbsences?: number;
}

// choirs/{choirId}/services/{serviceId}/attendance/{uid} — already exists
interface AttendanceRecord {
  status: 'present'|'absent'|'late'|'excused';
  markedAt: Timestamp;
  markedBy: string;          // director uid
  source: 'manual'|'qr'|'self';
  notes?: string;
}

// choirs/{choirId}/reminders/{reminderId} — outbox for Cloud Function
interface ReminderJob {
  serviceId: string;
  recipientUid: string;
  channel: 'sms'|'push'|'email';
  status: 'queued'|'sent'|'failed'|'skipped_opt_out';
  scheduledFor: Timestamp;
  sentAt?: Timestamp;
  errorCode?: string;
}
```

### Firestore collections (new + extended)

- Extend `choirs/{choirId}/members/{uid}` with `phone`, `smsOptIn`, `sectionLeadOf`, denormalised health fields.
- **New:** `choirs/{choirId}/reminders/{reminderId}` — reminder outbox (server-only writes via Cloud Function; clients read their own to show status).
- Extend `choirs/{choirId}/services/{serviceId}/attendance/{uid}` with `source`, `notes`.

### Key screens

- `src/pages/members/MemberDirectory.tsx` — director view of roster with health badge column (reliable/declining/flaky/new).
- `src/pages/members/MemberProfile.tsx` — phone + SMS opt-in toggle, voice part, sectional lead badge, 90-day attendance history chart.
- `src/pages/attendance/MarkAttendance.tsx` — service-day check-in: tap-grid + QR self-check-in fallback (camera not required v1).
- `src/pages/dashboard/DirectorRosterPanel.tsx` (dashboard widget) — "At-risk this week" list driven by `absencePattern`.
- `src/pages/settings/NotificationPreferences.tsx` — member-side: SMS/push/email toggles, quiet hours.

### Dependencies

- **Cloud Functions:** `sendServiceReminder` (HTTPS callable scheduled by `onServiceCreated` + cron at T-24h and T-3h); `recomputeAttendanceHealth` (Firestore trigger on `attendance/*` write — debounced via task queue).
- **Twilio** (SMS) via Cloud Function only; credentials in Functions config (`twilio.sid`, `twilio.token`, `twilio.from`). Never on client.
- **libphonenumber-js** on client for E.164 validation before save.
- **firestore-bigquery-export** extension off the table for v1; do counters in trigger.
- **Auth:** Twilio Verify for phone-number ownership before flipping `smsOptIn = true`.
- **Compliance:** STOP/HELP handling in Twilio webhook → flip `smsOptIn = false`; log to `reminders/` audit trail.

---

## B) Rehearsal — Scheduler + Calendar Sync, Agenda Builder, Post-Rehearsal Notes, Audio Opt-in, Practice Assignment

**Goal:** Replace the "Wednesday-night WhatsApp scramble" with a structured rehearsal lifecycle.

### Data model

```ts
// choirs/{choirId}/rehearsals/{rehearsalId}
interface Rehearsal {
  id: string;
  title: string;
  startAt: Timestamp;
  endAt: Timestamp;
  location?: { name: string; address?: string; geo?: GeoPoint };
  linkedServiceId?: string;       // the Sunday this prepares
  googleCalendarEventId?: string; // per-director sync
  agenda: AgendaBlock[];          // ordered
  audioOptIn: boolean;            // choir-default; per-member override below
  status: 'draft'|'published'|'in_progress'|'complete'|'cancelled';
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface AgendaBlock {
  id: string;
  kind: 'warmup'|'song'|'sectional'|'announcement'|'break'|'prayer';
  title: string;
  durationMin: number;
  songId?: string;        // when kind == 'song'
  sectionFilter?: ChoirMember['voicePart'][]; // sectional targeting
  notes?: string;
}

// choirs/{choirId}/rehearsals/{rehearsalId}/notes/{noteId} — post-rehearsal
interface RehearsalNote {
  authorUid: string;
  body: string;
  visibility: 'director_only'|'leaders'|'all';
  songId?: string;
  createdAt: Timestamp;
}

// choirs/{choirId}/rehearsals/{rehearsalId}/recordings/{recordingId}
interface RehearsalRecording {
  storagePath: string;            // gs://… in storage.rules-gated bucket
  durationSec: number;
  sizeBytes: number;
  uploadedBy: string;
  consentedMembers: string[];     // explicit opt-in uids present at upload
  songId?: string;
  transcript?: { storagePath: string; lang: string; }; // see Module F
  createdAt: Timestamp;
}

// choirs/{choirId}/practiceAssignments/{assignmentId}
interface PracticeAssignment {
  songId: string;
  assignedTo: 'all'|'section'|'individual';
  sectionFilter?: ChoirMember['voicePart'][];
  individualUids?: string[];
  dueBy: Timestamp;
  rehearsalId?: string;
  serviceId?: string;
  expectedMinutes?: number;
  createdBy: string;
}

// choirs/{choirId}/practiceAssignments/{assignmentId}/progress/{uid}
interface PracticeProgress {
  status: 'not_started'|'in_progress'|'complete';
  minutesLogged: number;
  lastWorkedAt?: Timestamp;
}
```

### Firestore collections

- New: `rehearsals/`, `rehearsals/{id}/notes/`, `rehearsals/{id}/recordings/`, `practiceAssignments/`, `practiceAssignments/{id}/progress/{uid}`.
- Add `defaultAudioOptIn: boolean` to `choirs/{choirId}` doc (choir-wide policy default).
- **Storage:** new bucket prefix `choirs/{choirId}/rehearsals/{rehearsalId}/audio/` — `storage.rules` gated to `isMemberOf(choirId)` read, director write, with file-size + MIME check.

### Key screens

- `src/pages/rehearsals/RehearsalList.tsx` — upcoming + past.
- `src/pages/rehearsals/RehearsalDetail.tsx` — agenda timeline, RSVP-from-availability, "Start rehearsal" button (flips status).
- `src/pages/rehearsals/AgendaBuilder.tsx` — drag-drop block editor (dnd-kit), per-block timer math, sectional targeting.
- `src/pages/rehearsals/PostRehearsalNotes.tsx` — quick capture of takeaways; visibility-scoped.
- `src/pages/rehearsals/AudioConsentModal.tsx` — recording opt-in gate (must collect explicit consent before any upload starts).
- `src/pages/practice/MyAssignments.tsx` (member) — list of due assignments with progress chip.
- `src/pages/practice/AssignmentDetail.tsx` — embeds song player + practice timer.

### Dependencies

- **Google Calendar:** `googleapis` in Cloud Function `syncRehearsalToCalendar` (director's OAuth tokens stored encrypted in `users/{uid}/secrets/google`; never readable by client).
- **dnd-kit/core + @dnd-kit/sortable** for agenda drag-drop.
- **Firebase Storage** + resumable uploads (`@firebase/storage`) for recordings; chunked.
- **Cloud Function:** `onRecordingFinalized` → enqueue transcript job (Module F).
- **Cron:** scheduled function `dispatchUpcomingRehearsalReminders` daily 07:00 local-tz.

---

## C) Song Library (Hardening)

**Goal:** Library already exists (Spotify art/lyrics via Musixmatch, key/BPM/genre/notes). Upgrade = enrich, multi-key, source-of-truth chord charts, search.

### Data model

```ts
// choirs/{choirId}/songs/{songId} — choir-private custom songs (existing)
// songs/{songId} — global library (existing, read-only)

interface SongDoc {
  id: string;
  title: string;
  artist?: string;
  ccliNumber?: string;          // for future CCLI reporting
  defaultKey: string;           // 'C', 'Eb', 'F#m'
  bpm?: number;
  timeSignature?: string;       // '4/4'
  genres: string[];
  themes: string[];             // 'communion','easter','call_to_worship'
  spotify?: { trackId: string; artUrl: string; previewUrl?: string };
  lyrics?: { provider: 'musixmatch'|'manual'; storagePath?: string; lang: string };
  chordCharts: ChordChart[];    // multiple keys
  attachments: SongAttachment[];// PDF, mp3 reference
  searchTokens: string[];       // lower-case n-grams of title+artist+themes for client filtering
  popularity: number;           // count of times in set lists, fan-out trigger
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface ChordChart {
  key: string;
  format: 'chordpro'|'pdf'|'image';
  storagePath?: string;
  inlineText?: string;
}

interface SongAttachment {
  kind: 'reference_mp3'|'sheet_music'|'arrangement_doc'|'rehearsal_track';
  title: string;
  storagePath: string;
  uploadedBy: string;
  voicePart?: ChoirMember['voicePart']; // SATB-specific rehearsal tracks
}
```

### Firestore collections

- Extend `songs/{songId}` and `choirs/{choirId}/songs/{songId}` schema as above (additive; backfill via migration script in `scripts/`).
- **Storage:** `songs/{songId}/charts/`, `songs/{songId}/attachments/`. Global songs read-only for all signed-in users; choir-private gated by `isMemberOf`.

### Key screens

- `src/pages/library/LibraryIndex.tsx` — already exists; add theme/key/BPM filter chips.
- `src/pages/library/SongDetail.tsx` — chord charts per key tab, attachments by voice part, "Add to set list" CTA.
- `src/pages/library/SongEditor.tsx` (director) — chord chart upload, attachment manager, CCLI number.

### Dependencies

- **Existing:** Spotify Web API (cached via `spotifyCache/`), Musixmatch (cached via `geniusCache/` despite name).
- **chordsheetjs** for ChordPro parsing → render to HTML/PDF.
- **react-pdf** for chart preview.
- **Cloud Function:** `recomputeSongPopularity` Firestore trigger on `setlist/*` writes.
- **Migration script** under `scripts/migrate-songs.ts` to add new fields safely.

---

## D) Set List Builder — Drag-Drop, Key Lock, PDF Export, Practice Mode

**Goal:** Existing `services/{id}/setlist` collection extended with reorderable structure, key locking, exportable artifact, member-side practice flow.

### Data model

```ts
// choirs/{choirId}/services/{serviceId}/setlist/{itemId}
interface SetListItem {
  id: string;
  songId: string;
  orderIndex: number;          // float spacing for cheap reorders ("LexoRank-lite")
  selectedKey: string;
  keyLocked: boolean;          // if true, transposition controls hidden member-side
  notes?: string;
  assignedLead?: string;       // uid of vocal lead
  assignedSoloists?: string[]; // SATB highlights
  segueToNext: boolean;
  durationEstimateSec?: number;
}

// choirs/{choirId}/services/{serviceId} — extend
interface Service {
  // …existing fields
  status: 'draft'|'published'|'archived';
  pdfExport?: { storagePath: string; generatedAt: Timestamp; revision: number };
  practiceModeEnabled: boolean;
}
```

### Firestore collections

- Extend existing `setlist` items with `orderIndex`, `keyLocked`, `assignedLead`, etc.
- **Storage:** `services/{serviceId}/exports/` for generated PDFs.

### Key screens

- `src/pages/services/SetListBuilder.tsx` — dnd-kit sortable list, key-locked badges, inline key picker, "Generate PDF" CTA.
- `src/pages/services/SetListView.tsx` (member) — read-only, practice mode toggle.
- `src/pages/services/PracticeMode.tsx` — full-screen song-by-song player with chord chart for member's `voicePart`, transposition slider (disabled if `keyLocked`), built-in metronome at song `bpm`.
- `src/pages/services/PDFPreview.tsx` — preflight before export.

### Dependencies

- **dnd-kit** (shared with Module B).
- **pdf-lib** or **@react-pdf/renderer** running in a Cloud Function `generateSetListPdf` to keep client bundle small.
- **tone.js** (small) for metronome click in practice mode.
- **chordsheetjs** + transposition utility (`transposeChord(key, semitones)`).

---

## E) Communication Hub — Internal Messaging, Announcements, Section Threads, Read Receipts

**Goal:** Build on existing `channels/` + `messages/` (already in rules). Add read receipts, section auto-channels, announcement boosting.

### Data model

```ts
// choirs/{choirId}/channels/{channelId} — exists; extend
interface Channel {
  id: string;
  name: string;
  kind: 'general'|'section'|'service'|'song'|'announcements';
  visibleTo: 'all'|'vocalists'|'instrumentalists';
  directorOnly: boolean;
  sectionFilter?: ChoirMember['voicePart'][]; // for section channels
  linkedServiceId?: string;
  linkedSongId?: string;
  pinnedMessageIds: string[];
  unreadCounts?: Record<string, number>; // denormalised per uid, fan-out
}

// choirs/{choirId}/channels/{channelId}/messages/{messageId} — exists; extend
interface ChannelMessage {
  id: string;
  authorId: string;
  body: string;
  attachments?: { storagePath: string; mime: string }[];
  replyToId?: string;
  reactions?: Record<string, string[]>; // emoji → uids
  createdAt: Timestamp;
  editedAt?: Timestamp;
}

// choirs/{choirId}/channels/{channelId}/reads/{uid} — per-user read pointer
interface ChannelReadState {
  lastReadMessageId: string;
  lastReadAt: Timestamp;
}

// choirs/{choirId}/announcements/{announcementId} — exists; extend
interface Announcement {
  // …existing
  category: 'important'|'community'|'info';
  pinUntil?: Timestamp;
  ackRequired: boolean;
  acknowledgedBy?: string[]; // for ack-required announcements
}
```

### Firestore collections

- Extend `channels/` with `kind`, `sectionFilter`, `linkedServiceId`, `linkedSongId`, `pinnedMessageIds`.
- New: `channels/{channelId}/reads/{uid}` (own-doc write only).
- Extend `announcements/` with `ackRequired`, `acknowledgedBy`.

### Key screens

- `src/pages/messages/ChannelList.tsx` — section/service/song channels grouped; unread badges.
- `src/pages/messages/ChannelDetail.tsx` — message list with read-receipt indicator on own messages.
- `src/pages/announcements/AnnouncementFeed.tsx` — exists; add ack CTA.
- `src/pages/messages/NewSectionChannel.tsx` — director auto-create per section.

### Dependencies

- **Cloud Function:** `onChannelMessageCreate` → fan-out unread counter increments + push notifications via FCM (existing).
- **Cloud Function:** `markReadCleanup` scheduled — recompute unread counts (defensive).
- **No external messaging service.** Stays in Firestore for cost + latency.

---

## F) AI Integration Phase 2 — Song Suggestion, Pitch Feedback, Transcription, Translation, SATB Arranger

**Goal:** Wrap server-side AI calls (Anthropic + Google STT + custom model) in Cloud Functions. Never call third-party AI from the client — keys stay server-side.

### Data model

```ts
// choirs/{choirId}/aiSuggestions/{suggestionId}
interface SongSuggestion {
  serviceId: string;
  prompt: { theme?: string; scripture?: string; mood?: string; durationMin?: number };
  candidates: { songId: string; confidence: number; rationale: string }[];
  modelVersion: string;
  createdBy: string;
  acceptedSongId?: string;
}

// choirs/{choirId}/rehearsals/{rehearsalId}/recordings/{recordingId} — extend Module B
// add ai analysis sub-doc
interface PitchAnalysis {
  storagePath: string;        // JSON: { tFrames:number[], expectedHz:number, observedHz:number, centsOff:number }[]
  summary: { meanCentsOff: number; sectionsOff: ('soprano'|'alto'|'tenor'|'bass')[] };
  modelVersion: string;
}

// choirs/{choirId}/rehearsals/{rehearsalId}/recordings/{recordingId}/transcripts/{lang}
interface Transcript {
  lang: string;               // 'en','es','pt-br'
  segments: { startSec: number; endSec: number; text: string; speakerTag?: string }[];
  provider: 'google_stt'|'whisper';
  modelVersion: string;
}

// songs/{songId}/arrangements/{arrangementId}
interface SATBArrangement {
  sourceSongId: string;
  inputKey: string;
  outputKey: string;
  voicing: 'SATB'|'SAB'|'SA'|'TB';
  charts: { voice: 'S'|'A'|'T'|'B'; storagePath: string; format: 'musicxml'|'pdf' }[];
  modelVersion: string;
  createdBy: string;
  approvedBy?: string;        // director review gate
}
```

### Firestore collections

- New: `aiSuggestions/`, `recordings/{id}/transcripts/{lang}`, `songs/{id}/arrangements/`.
- New `aiJobs/{jobId}` audit collection (Cloud Function writes only) — queue + status + cost tracking.

### Key screens

- `src/pages/services/SuggestSongs.tsx` — director enters theme/scripture; result list with rationale.
- `src/pages/rehearsals/PitchFeedback.tsx` — heatmap over recording timeline; per-section badge.
- `src/pages/rehearsals/RecordingTranscript.tsx` — segments list, language switcher.
- `src/pages/library/ArrangementGenerator.tsx` (director) — request SATB arrangement; review + approve before publish.
- `src/pages/settings/AIPreferences.tsx` — choir-wide AI usage caps + opt-out per member.

### Dependencies

- **Anthropic SDK** (`@anthropic-ai/sdk`) inside Cloud Function `suggestSongs`, `generateArrangement`. Use `claude-opus-4-6` for arranging, `claude-sonnet-4-6` for suggestion/translation. Keys in Functions config only.
- **Google Cloud Speech-to-Text** (`@google-cloud/speech`) for transcription.
- **Translation** via Claude (single hop) or Google Translate API; cache per `(recordingId, lang)`.
- **Pitch analysis:** WASM `crepe` model or yin-pitch detector running in a Cloud Run worker (Functions timeout too short). Job queued via Pub/Sub.
- **Cost gate:** `aiJobs/` enforces per-choir monthly budget; reject job if exceeded.
- **Safety:** all AI-generated content marked `provenance: 'ai'` in client UI; arrangements require director approval before showing to members.

---

## G) Director Intelligence Dashboard — Health Score, Weekly Briefing, At-Risk Flags, Set List Analytics

**Goal:** Roll up everything above into one screen the director opens Sunday afternoon.

### Data model

```ts
// choirs/{choirId}/intelligence/health — single doc, recomputed nightly
interface ChoirHealthSnapshot {
  generatedAt: Timestamp;
  windowDays: 30 | 90;
  overallScore: number;                  // 0..100
  pillars: {
    attendance: { score: number; trend: 'up'|'flat'|'down'; details: string };
    practice:   { score: number; trend: 'up'|'flat'|'down'; details: string };
    response:   { score: number; trend: 'up'|'flat'|'down'; details: string }; // availability response rate
    repertoire: { score: number; trend: 'up'|'flat'|'down'; details: string }; // new songs / staleness
  };
  atRiskMembers: { uid: string; reason: string; severity: 'low'|'med'|'high' }[];
  modelVersion: string;
}

// choirs/{choirId}/intelligence/briefings/{weekIso} — '2026-W22'
interface WeeklyBriefing {
  weekIso: string;
  markdown: string;            // Claude-generated narrative
  highlights: string[];
  actions: { label: string; deeplink: string }[];
  generatedAt: Timestamp;
  modelVersion: string;
}

// choirs/{choirId}/intelligence/setlistAnalytics/{serviceId}
interface SetListAnalytics {
  serviceId: string;
  songCount: number;
  totalDurationSec: number;
  keyDistribution: Record<string, number>;
  themeDistribution: Record<string, number>;
  staleness: { meanDaysSinceLastSung: number; repeatedFromLastN: number };
  satbCoverageWarnings: string[]; // e.g. "no alto-led song"
}
```

### Firestore collections

- New: `choirs/{choirId}/intelligence/health` (single doc), `intelligence/briefings/{weekIso}`, `intelligence/setlistAnalytics/{serviceId}`.

### Key screens

- `src/pages/dashboard/DirectorIntelligence.tsx` — top-line score, four pillar cards, at-risk list with one-tap "nudge".
- `src/pages/dashboard/WeeklyBriefing.tsx` — markdown briefing + action buttons.
- `src/pages/services/SetListAnalyticsPanel.tsx` — embedded in `SetListBuilder` (warnings inline before publish).

### Dependencies

- **Cloud Functions:**
  - Scheduled `recomputeChoirHealth` (nightly 02:00 local-tz of choir).
  - Scheduled `generateWeeklyBriefing` (Sunday 13:00) — pulls last week's data, calls Claude Sonnet 4.6 for narrative, writes briefing doc.
  - Firestore trigger `onSetListPublish` → compute `setlistAnalytics`.
- **Anthropic SDK** (server-only).
- **Existing data:** reads from Module A (attendance), B (practice), E (response rates), D (set lists).

---

## H) Church Admin Layer — Multi-Choir, Budget, Event Logging, CMS Integrations

**Goal:** Pull the org level above the choir. This is the Horizon 3 wedge that converts "free director account" into "multi-campus revenue".

### Data model

```ts
// orgs/{orgId} — new top-level
interface Organization {
  id: string;
  name: string;
  type: 'church'|'school'|'community'|'enterprise';
  billingEmail: string;
  plan: 'free'|'pro'|'church'|'enterprise';
  seatLimit?: number;
  choirIds: string[];               // denorm of orgs/{orgId}/choirs/
  createdAt: Timestamp;
}

// orgs/{orgId}/members/{uid} — org-level roles (not choir-scoped)
interface OrgMember {
  uid: string;
  orgRole: 'org_admin'|'campus_admin'|'choir_director'|'viewer';
  campusIds?: string[];
}

// orgs/{orgId}/campuses/{campusId}
interface Campus {
  id: string;
  name: string;
  timezone: string;
  choirIds: string[];
}

// Extend choirs/{choirId} with orgId + campusId
interface ChoirDoc {
  // …existing
  orgId?: string;       // when present, choir is org-managed
  campusId?: string;
}

// orgs/{orgId}/budgets/{budgetId}
interface Budget {
  fiscalYear: string;
  category: 'music_licensing'|'guest_musicians'|'equipment'|'travel'|'training'|'other';
  allocated: number;    // cents
  spent: number;        // denorm
  currency: 'USD'|'GBP'|'EUR'|'NGN'|'…';
}

// orgs/{orgId}/budgets/{budgetId}/entries/{entryId}
interface BudgetEntry {
  amount: number;
  description: string;
  occurredAt: Timestamp;
  attachmentStoragePath?: string;   // receipt image
  enteredBy: string;
}

// orgs/{orgId}/eventLog/{eventId} — audit / activity timeline
interface OrgEvent {
  kind: 'service_held'|'rehearsal_held'|'member_joined'|'member_left'|'budget_entry'|'cms_sync';
  choirId?: string;
  campusId?: string;
  actorUid?: string;
  payload: Record<string, unknown>;
  at: Timestamp;
}

// orgs/{orgId}/integrations/{integrationId}
interface Integration {
  provider: 'planning_center'|'propresenter'|'ccli_reporting'|'planning_center_calendar'|'multitracks';
  status: 'connected'|'disconnected'|'error';
  encryptedTokens: string;     // KMS-encrypted, never readable from client
  syncSettings: Record<string, unknown>;
  lastSyncAt?: Timestamp;
  lastError?: string;
}
```

### Firestore collections

- **New top-level:** `orgs/{orgId}` with subcollections `members`, `campuses`, `budgets`, `budgets/{id}/entries`, `eventLog`, `integrations`.
- Extend `choirs/{choirId}` with `orgId`, `campusId`.
- **Security rules:** new `orgs/` block — `isOrgAdmin(orgId)`, `isCampusAdmin(orgId, campusId)`. Org admin can write across all org choirs.

### Key screens

- `src/pages/admin/OrgDashboard.tsx` — org admin home: choirs grid, plan/seat usage, budget summary.
- `src/pages/admin/Campuses.tsx` — campus CRUD.
- `src/pages/admin/Budgets.tsx` + `BudgetDetail.tsx` — allocation + entry list + receipt upload.
- `src/pages/admin/EventLog.tsx` — filterable activity feed.
- `src/pages/admin/Integrations.tsx` — connect/disconnect PC/ProPresenter/CCLI; per-integration config sheet.
- `src/pages/admin/Billing.tsx` — Stripe customer portal handoff.

### Dependencies

- **Stripe** for plan + seat billing (Cloud Function `createCustomerPortalLink`).
- **Planning Center API** — OAuth2 + `/services/v2/` for plan + people sync. Tokens KMS-encrypted.
- **CCLI SongSelect** — read-only reporting API (CCLI reporting requires partner agreement; build the data model now, gate the integration on partner approval).
- **ProPresenter** — local-network sync is fiddly; v1 is a one-way set list export (RTF + JSON) the user downloads and imports.
- **MultiTracks** — link out + metadata only; no audio reseller licence v1.
- **Google KMS** (or Firebase Functions secrets manager) for integration tokens.
- **Cloud Functions:** `cmsSyncCron` per integration; `onChoirEvent` → write `eventLog`.

---

## Cross-module dependencies + sequencing

```
A (Choir Core) ──┐
                 ├──→ G (Intelligence) ──→ H (Church Admin)
B (Rehearsal) ───┤        ↑
                 │        │
C (Library) ──→ D (Set Lists) ──→ F (AI Phase 2)
                                       │
E (Comms Hub) ─────────────────────────┘
```

**Suggested build order (parallelisable per module, but dependent on these gates):**
1. **A** + **C** hardening in parallel — they unblock everything else.
2. **B** + **D** — both rely on **A** members and **C** songs.
3. **E** — independent UX track; can run alongside B/D.
4. **F** — needs **B** (recordings) and **C** (songs) shapes locked.
5. **G** — needs A/B/D/E denormalised counters in place.
6. **H** — last; introduces the org/multi-tenant layer and migrations.

## Delegation plan (CTO → Engineer / Designer)

- Each module above gets one **parent child-issue** under HARA-26 with:
  - data-model migration (script + index) subtask,
  - Firestore rules subtask (security-reviewed),
  - Cloud Functions subtask (if any),
  - per-screen subtasks routed to Engineer,
  - design subtasks routed to Designer for novel UI (agenda builder, intelligence dashboard, set list practice mode).
- Module H requires a **founder approval gate** before any rules/billing changes — flag for the board.
- Module F requires an **AI budget cap + opt-out** policy doc before any model is shipped — flag for the board.

## Verification & guardrails

- **Type-check gate:** every PR runs `npx tsc --noEmit -p tsconfig.app.json`. Zero errors or no push.
- **Rules tests:** new `firestore.rules` blocks must come with `firebase emulators:exec` rule tests in `functions/test/`.
- **Indexes:** every module ships `firestore.indexes.json` diffs.
- **Playwright happy-path** per new screen in `e2e/`.
- **Performance budget:** no new client dep > 30KB gzip without CTO sign-off (dnd-kit, pdf renderer, tone.js are pre-approved).
- **Secrets:** Twilio, Stripe, Anthropic, Google STT, Planning Center, KMS — all server-side only; never imported in `src/`.
