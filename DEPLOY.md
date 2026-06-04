# Deploying Harmoniq Cloud Functions

How to deploy the `getSongContext` Cloud Function and set the OpenAI API key it
needs. The function calls OpenAI's `gpt-4o-mini` to generate the "About this
song" card on the song detail page.

The code is already written, committed, and pushed to `main`. Nothing in the
code needs editing — this is purely a key + deploy operation.

---

## Security rule (read first)

The OpenAI API key goes in **one place only**: the interactive secret prompt in
step 5. Never put it in a command argument, a file, a commit, or a chat message.
If it is ever exposed, revoke it at <https://platform.openai.com/api-keys> and
create a new one.

---

## Prerequisites

- Firebase project **Owner** login, or be added to the project as **Editor**.
- An OpenAI API key with **billing enabled** (<https://platform.openai.com> →
  API keys → Create). Confirm the account has a payment method or credits, or
  the calls will fail silently in the app.
- Node.js installed — `node -v` should print a version.

---

## Steps

Run one at a time. Stop if any step errors.

### 1. Install the Firebase CLI

```bash
npm install -g firebase-tools
```

Verify: `firebase --version` prints a version (known-good: 14.x).
If you later see `firebase: command not found`, this step did not complete —
re-run it.

### 2. Log in (opens a browser)

```bash
firebase login
```

### 3. Get into the repo

Clone fresh (requires access to the private repo):

```bash
git clone https://github.com/vannaenae/harmoniq.git
cd harmoniq
```

Verify you are in the right place — `ls` should show a `functions` folder and a
`firebase.json`. Every command below is run **from the repo root**.

### 4. Confirm the linked Firebase project

```bash
firebase use
```

If it says no active project:

```bash
firebase use --add
```

…and pick the Harmoniq project.

### 5. Set the secret

Run **exactly** this — the literal words `OPENAI_API_KEY`, not the key itself:

```bash
firebase functions:secrets:set OPENAI_API_KEY
```

When it prints `? Enter a value for OPENAI_API_KEY:`, paste the OpenAI key and
press Enter. **This is the only place the key should ever go.**

> **Important — the other secrets.** `functions/src/index.ts` declares **five**
> secrets: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`, `GENIUS_TOKEN`,
> `YOUTUBE_API_KEY`, and `OPENAI_API_KEY`. A Firebase v2 deploy **fails** if any
> declared secret has no value in Secret Manager. If this project has already
> been deployed before, the other four are already set and you only need
> `OPENAI_API_KEY`. If this is a first-ever deploy on a fresh Firebase project,
> set each one the same way before deploying:
>
> ```bash
> firebase functions:secrets:set SPOTIFY_CLIENT_ID
> firebase functions:secrets:set SPOTIFY_CLIENT_SECRET
> firebase functions:secrets:set GENIUS_TOKEN
> firebase functions:secrets:set YOUTUBE_API_KEY
> ```
>
> To see what's already set: check Firebase console → Functions → Secrets, or
> just attempt the deploy — it will tell you which secret value is missing.

### 6. Deploy the functions

From the repo root:

```bash
npm --prefix functions run deploy
```

(Equivalent: `firebase deploy --only functions` from the repo root.)

Success looks like `✔ Deploy complete!` with `getSongContext` listed alongside
the Spotify, Genius, and YouTube functions.

> A secret only takes effect after a deploy. If you ever rotate the key
> (re-run step 5), you must re-run step 6 for the new value to apply.

---

## Verify it worked

1. Open <https://harmoniqs.vercel.app> → Library → tap any song.
2. The **"About this song"** card should populate with a description, theme
   badges, and a resonance line within ~2 seconds.

If it says **"No context available for this song"** — the deploy worked but the
OpenAI call failed. Almost always: missing/revoked key, or no billing on the
OpenAI account. Re-check step 5 and OpenAI billing.

If the card stays as a **loading skeleton** — the function is not deployed yet.
Re-run step 6.

---

---

## CCLI SongSelect setup (optional)

SongSelect shows official worship song lyrics inside the app when you search, and
stores the CCLI number on saved songs so lyrics are always pulled from the
licensed source.

### Prerequisites

- An active **CCLI Church License** (your church already has this if you print
  song lyrics in services).
- API credentials from the **CCLI Developer Portal**:
  <https://developer.ccli.com> → Register → Create an application.
  You will receive a `client_id` and `client_secret`.

### Set the secrets

```bash
firebase functions:secrets:set CCLI_CLIENT_ID
firebase functions:secrets:set CCLI_CLIENT_SECRET
```

Enter the values at the interactive prompt exactly as shown in the developer
portal — never paste them into a command argument.

Then re-deploy functions:

```bash
npm --prefix functions run deploy
```

Once deployed, the Song Library search will show a **CCLI SongSelect** section
alongside Spotify and YouTube results. Saving a CCLI song stores its song number
in Firestore, and the song detail page will display the official licensed lyrics
with a copyright notice.

If CCLI credentials are not set the SongSelect section shows
"CCLI credentials may not be configured yet" — the rest of the app continues to
work normally.

---

## Common mistakes

| Symptom | Cause | Fix |
|---|---|---|
| `firebase: command not found` | Step 1 did not complete | Re-run `npm install -g firebase-tools` |
| `Could not read package.json` | Running from home directory, not the repo | `cd` into the cloned `harmoniq` folder |
| Card says "No context available" | Bad/revoked key or no OpenAI billing | Revoke key, create a new one, repeat step 5 then 6 |
| Card stays loading forever | Functions not deployed | Re-run step 6 |
| Deploy fails with "secret has no value" | A required secret is not set | Run `firebase functions:secrets:set <SECRET_NAME>` for the missing one |
