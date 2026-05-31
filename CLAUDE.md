# Harmoniq — Engineering Ground Truth

You are working on **Harmoniq** — "Vocal excellence, coordinated." A mobile-first operating system for worship choirs that replaces scattered WhatsApp groups, spreadsheets, and paper set lists. Two-sided, single app: directors get a control panel, members get a calm "what's next, what do I do" view.

Work autonomously. Do not ask permission for standard execution decisions. One screen/fix = one commit = one push to `main`. **Never push a red build.**

> ⚠️ A previous version of this file described an Expo / React Native / StyleSheet app. **That stack is abandoned.** The live app — the one in this repo and deployed to production — is a **React + Vite + Tailwind web app**. Build for THIS stack. Ignore any older Expo/StyleSheet instructions.

---

## The Real Stack (no substitutions)

| Layer | Choice |
|---|---|
| Framework | **React 19** (function components + hooks) |
| Build/dev | **Vite 6** — `npm run dev`, `npm run build` (`tsc -b && vite build`), `npm run preview` |
| Language | **TypeScript ~5.8**, strict |
| Routing | **react-router-dom v7** — routes declared in `src/App.tsx` (lazy-loaded), NOT file-based |
| Styling | **Tailwind CSS 3** utility classes + **Radix UI** primitives (`@radix-ui/react-*`) |
| Icons | **lucide-react** (e.g. `import { Bell } from 'lucide-react'`). No emojis. |
| State | **Zustand 5** + React context (`AuthContext`, `ChoirContext`) |
| Auth + DB | **Firebase 12** (Auth + Firestore + Storage); Cloud Functions in `functions/` |
| Drag/drop | `@dnd-kit/*` (used in the set-list builder) |
| Utilities | `clsx` + `tailwind-merge` (see `lib/utils.ts` `cn()`), `nanoid`, `qrcode.react` |
| Tests | **Playwright** e2e — `npm run test:e2e` (`e2e/`, `playwright.config.ts`) |
| Deploy | **Vercel** (SPA rewrite in `vercel.json`); pushing to `main` ships to production |

Path alias: `@/` → `src/`.

---

## Repository

- Repo: `https://github.com/vannaenae/harmoniq.git` — branch `main`, commit and push directly.
- Code root: `/Users/vanessaadetoro/Coding/Harmoniq/harmoniq/`
- Structure:
  - `src/pages/{auth,onboarding,dashboard,services,availability,members,library,attendance,announcements,notifications,messages,settings}` — feature screens
  - `src/components/{ui,layout,auth}` — shared UI (Radix-based `ui/`, `BottomNav`/`Sidebar`/`PageHeader` in `layout/`)
  - `src/contexts/{AuthContext,ChoirContext}.tsx` · `src/hooks/` · `lib/{firebase,utils}.ts`
  - `functions/src/` — Firebase Cloud Functions (`index.ts`, `seed.ts`)
  - `stitch_harmoniq_vocalflow_design_system/` (one level up) — **design source of truth** (PNG + `*_code.html` per screen)
- Product spec: `../JULES_BUILD_PROMPT.md`. Firebase setup: `../FIREBASE_SETUP_PROMPT.md`.

---

## What already exists (do NOT rebuild — read first, extend)

Most core screens are shipped and wired in `src/App.tsx`:
auth (SignIn/SignUp/ForgotPassword/VerifyEmail) · onboarding (RoleSelection/CreateOrJoinChoir/VoicePart) · Dashboard · Services (ServicesList, ServiceForm, **SetListBuilder** w/ dnd-kit, SetListDetail, SongDetail, ServiceRoster) · Availability (Mark + Overview) · Members (Directory, Profile, Invite, VoicePartRequest) · Library (SongLibrary, SongLibraryDetail, AddCustomSong) · Attendance (Tracker + MyAttendance) · Announcements (Feed + Create) · NotificationCentre · Messages (Layout + ChannelView) · Settings (Settings, MyProfile, ChoirSettings, NotificationSettings, DeleteAccount).

**Before building anything: `ls src/pages`, open the nearest existing page + a `src/components/ui` primitive, and match those patterns exactly.** Build only what is genuinely missing or broken.

---

## Definition of Done (hard gate before every push)

1. **`npx tsc --noEmit -p tsconfig.app.json` prints ZERO errors.** If not, fix it — never push red.
2. Matches the design source of truth in `stitch_harmoniq_vocalflow_design_system/`.
3. Loading / error / empty states present on any data-driven screen.
4. Real-time Firestore (`onSnapshot`) for list screens, not one-shot reads.
5. Admin actions role-gated (owner/admin) via the auth/choir context.
6. Conventional commit (`feat:` / `fix:` / `refactor:`), present tense.
7. After push: confirm `git rev-parse HEAD` == `git rev-parse origin/main` and the build is still green.

## Conventions

- Icons: `lucide-react` only, zero emojis.
- Styling: Tailwind classes; compose with `cn()` from `lib/utils.ts`; prefer existing `src/components/ui` primitives over raw markup.
- Never commit `.expo/`, `expo-env.d.ts`, `.env`, or secrets (stale-stack cruft / sensitive — gitignored).
- Never touch `firestore.rules` / `storage.rules` security logic, pricing, data-deletion, or auth flows without flagging the board first.
- Never force-push or rewrite published history.

## Firestore model (per choir)

`choirs/{choirId}` → `name, inviteCode, ownerId, rehearsalDays[], createdAt`, with subcollections: `members/{userId}`, `songs/{songId}`, `setLists/{setListId}`, `rehearsals|services/{id}`, `announcements/{id}`, `availability/{setListId_userId}`. Handle Firestore Timestamps defensively (may arrive as string or Timestamp).
