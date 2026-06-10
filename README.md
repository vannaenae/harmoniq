# Harmoniq

**Vocal excellence, coordinated.** A mobile-first operating system for worship choirs — set lists, availability, song library, attendance, announcements, and AI-assisted planning, all in one place.

## Stack

React 19 + Vite 6 + TypeScript (strict) · Tailwind CSS 3 + Radix UI · Zustand 5 · Firebase 12 (Auth + Firestore + Storage + Cloud Functions) · react-router-dom v7 · Playwright e2e · Vercel deploy.

## Quick start

```bash
npm install
npm run dev           # local dev server
npm run build         # tsc -b && vite build
npm run preview       # serve the production build
npm run test:e2e      # Playwright e2e suite
```

Path alias: `@/` → `src/`.

## Repository layout

- `src/pages/{auth,onboarding,dashboard,services,availability,members,library,attendance,announcements,notifications,messages,settings}` — feature screens.
- `src/components/{ui,layout,auth}` — shared UI primitives and layout shells.
- `src/contexts/{AuthContext,ChoirContext}.tsx` — auth and active-choir state.
- `lib/firebase.ts`, `lib/utils.ts` — Firebase client and Tailwind `cn()`.
- `functions/src/` — Firebase Cloud Functions (HTTPS callables + Firestore triggers).
- `e2e/` — Playwright tests, configured in `playwright.config.ts`.
- `docs/` — engineering policy and architecture (see below).

## Policy

- **[AI Privacy Doctrine](./docs/ai-privacy-doctrine.md)** — company policy governing every AI feature. All AI tickets reference it.
- **[Full Product Upgrade Spec](./docs/architecture/full-product-upgrade-spec.md)** — technical architecture for the 8 upgrade modules (HARA-26).

## Conventions

- Icons: `lucide-react` only. No emojis.
- Styling: Tailwind classes, composed with `cn()`. Prefer the primitives in `src/components/ui` over raw markup.
- Data: real-time `onSnapshot` for list views; one-shot reads for reports.
- Build gate: `npx tsc --noEmit -p tsconfig.app.json` must be 0 before any push.

See `CLAUDE.md` for the full engineering ground truth.

## Native app (iOS / Android) via Capacitor

Harmoniq uses [Capacitor](https://capacitorjs.com) to wrap the web app as a native iOS and Android app. Config lives in `capacitor.config.ts` (app ID: `com.harmoniq.app`). The `ios/` and `android/` directories are git-ignored — generate them locally before opening in Xcode / Android Studio.

```bash
# 1. Build the web assets (required before every sync)
npm run build

# 2. Sync web assets into native projects
npx cap sync

# One-time setup — generate native project directories
npx cap add ios
npx cap add android

# Open in Xcode (requires macOS + Xcode)
npx cap open ios

# Open in Android Studio
npx cap open android
```

After making web changes, always run `npm run build && npx cap sync` before opening in Xcode / Android Studio.
