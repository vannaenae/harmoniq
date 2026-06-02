# Harmoniq AI Privacy Doctrine

**Author:** CTO · **Locked:** 2026-06-02 (HARA-42) · **Source:** HARA-28 AI Integration Roadmap, §"Privacy & ethics constraints"

This document is **company policy**, not per-feature guidance. Every AI feature shipped by Harmoniq complies with the constraints below. New AI features must reference this doctrine in their ticket description and reaffirm compliance at code review.

Choirs hold deeply sensitive data — minors, attendance, voice recordings, member relationships, religious practice. Worship leaders trust Harmoniq with information they would not give to a generic SaaS. The constraints in this doctrine are how we earn and keep that trust.

---

## The eight rules

### 1. No training on customer data without explicit opt-in
Every provider call enforces no-training / no-retention flags at the **request level**, not just the account level. Account-level opt-outs drift; per-request flags do not. Provider clients (`src/lib/ai/*`, `functions/src/ai/*`) set these flags by default and fail closed if a provider does not support them.

**Applies to:** Claude (Anthropic), OpenAI, Google Gemini, Mistral, and any future provider.

### 2. No voice biometrics
We never identify individual singers from audio. Voice features (e.g. practice tracks, pitch feedback) operate on the audio of one consenting member at a time and never build a per-person voiceprint, embedding, or biometric template.

**Implication:** No "who sang this?" features. Ever.

### 3. Member data minimization
AI features receive the **minimum data** needed for the task:

- Song suggestion: receives song metadata + aggregate set-list history. Never individual attendance records.
- Translation: receives lyric text + target language. Never member names, voice parts, or contact info.
- Practice feedback: receives the audio of the consenting member only.
- Announcements draft: receives the director's prompt + choir name. Never the member roster.

Server-side request builders strip non-required fields before dispatch. Audit log (rule 6) records what fields were sent.

### 4. Per-feature opt-in for sensitive features
Sensitive features — rehearsal recording, practice audio analysis, biometric-adjacent inference — are **off by default** and require an in-app opt-in from the affected member (not just the director). Director opt-in is necessary but not sufficient.

Opt-in is per-feature, not blanket. Revocation is one tap and immediate.

### 5. Right to delete
AI-generated derivatives — translations, suggested set lists, draft announcements, transcripts — are **deletable on member or owner request** and are included in account-deletion flows. Soft-delete is not enough: the underlying derivative is hard-deleted within 30 days, including from provider caches where the provider supports deletion APIs.

Account deletion cascades: deleting a member cascades to their opted-in audio + derivatives. Deleting a choir cascades to all choir-scoped derivatives.

### 6. Audit log
Every provider call writes a row to `aiAuditLog` containing:

- `promptHash` (SHA-256 of the prompt) — never the full prompt content.
- `modelId` (e.g. `claude-sonnet-4-6`).
- `choirId`.
- `feature` (e.g. `song_suggestion`, `translation`, `practice_feedback`).
- `timestamp`.
- `requesterUid`.
- `tokenCount` (in + out, for cost accounting).
- `fieldsSent` (the keys passed to the model — for rule 3 enforcement audits).

Full prompt content is **never logged**. The hash exists for incident triage ("did this prompt happen?") without retaining the underlying data.

### 7. AI output is labeled
No hidden AI. Every AI-generated artifact in the product surface carries a visible label:

- Translations: "AI draft — needs review" until a director approves.
- Suggested songs: "Suggested" badge.
- Draft announcements: "AI-generated, may contain errors" footer.
- Practice feedback: "AI feedback — for guidance only".

Labels do not disappear after director approval — they reduce in prominence but the artifact's AI origin remains discoverable.

### 8. Compliance forward
Harmoniq targets GDPR, CCPA, COPPA, and the EU AI Act. Specifically:

- **COPPA:** Choirs include minors. Members under 13 require verified parental consent for any opt-in feature (rule 4). The member's age is captured at choir invite and gates the opt-in UI.
- **GDPR:** Right to access, rectify, and delete (rule 5). Data processing agreements with every AI provider. DPIA documented per AI feature.
- **CCPA:** Same baseline as GDPR for California members; no sale of personal information.
- **EU AI Act:** Practice-feedback features are limited-risk; we publish a model card per feature and surface the labeling required by rule 7.

---

## How this doctrine is enforced in code

- `functions/src/ai/gateway.ts` (the AI gateway built in HARA-38) is the **single chokepoint** for provider calls. It enforces rules 1, 3, and 6 by default — features cannot bypass it.
- The audit log is written by the gateway, not by the calling feature. Features cannot suppress the log.
- The `aiAuditLog` collection has a retention policy: 365 days, then automated deletion via Cloud Function.
- Firestore security rules deny direct client writes to `aiAuditLog` (gateway is the only writer).
- TypeScript types for AI calls require the `feature` label and the explicit set of fields being sent — rule 3 is enforced at the type system level where possible.

## How this doctrine is referenced in tickets

Every Phase 1 (and later) AI feature ticket description ends with:

> Complies with [AI Privacy Doctrine](/docs/ai-privacy-doctrine.md).

Pull requests touching `src/lib/ai/*` or `functions/src/ai/*` must include a sentence in the description naming which rules apply and how the change preserves them.

## Amending this doctrine

Changes require CTO + CEO sign-off and a comment thread on a new ticket of the form "HARA-XX — AI Doctrine amendment: <summary>". Doctrine is locked, not frozen — but the bar is "what new constraint or fact required the change?", not "is this convenient for the roadmap?".

---

**Status:** Locked as company policy 2026-06-02 via HARA-42. All in-flight Phase 1 AI tickets (HARA-39 Song Suggestion, HARA-40 Translation, HARA-41 Musixmatch review, HARA-43 Suggestion UI, HARA-44 Translation reviewer UX) reference this doctrine in their description.
