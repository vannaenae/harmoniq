#!/usr/bin/env bash
#
# Harmoniq — one-shot setup for the "About this song" AI card.
# Run this from anywhere on your Mac:
#
#     bash setup-ai.sh
#
# It installs the Firebase CLI if needed, logs you in, finds the repo,
# sets the OpenAI key (you paste it once, privately, at the prompt),
# and deploys. Safe to re-run.

set -e

echo ""
echo "==> Harmoniq AI setup"
echo ""

# 1. Firebase CLI -------------------------------------------------------------
if ! command -v firebase >/dev/null 2>&1; then
  echo "==> Installing Firebase CLI (one time)…"
  npm install -g firebase-tools
else
  echo "==> Firebase CLI already installed ($(firebase --version 2>/dev/null | head -1))"
fi

# 2. Login --------------------------------------------------------------------
echo ""
echo "==> Checking Firebase login…"
if ! firebase projects:list >/dev/null 2>&1; then
  echo "    A browser window will open — sign in with the Google account that owns the Harmoniq Firebase project."
  firebase login
else
  echo "    Already logged in."
fi

# 3. Find the repo ------------------------------------------------------------
echo ""
echo "==> Locating the harmoniq repo…"
REPO=""
for dir in "$PWD" "$HOME/harmoniq" "$HOME/Documents/harmoniq" "$HOME/Desktop/harmoniq" "$HOME/Developer/harmoniq" "$HOME/code/harmoniq" "$HOME/projects/harmoniq"; do
  if [ -f "$dir/firebase.json" ] && [ -d "$dir/functions" ]; then
    REPO="$dir"; break
  fi
done

if [ -z "$REPO" ]; then
  echo "    Couldn't auto-find it. Searching your home folder (may take a moment)…"
  REPO="$(find "$HOME" -maxdepth 5 -name firebase.json -path '*harmoniq*' 2>/dev/null | head -1 | xargs -I{} dirname {} 2>/dev/null || true)"
fi

if [ -z "$REPO" ]; then
  echo ""
  echo "    Repo not found on this Mac. Cloning a fresh copy into ~/harmoniq…"
  git clone https://github.com/vannaenae/harmoniq.git "$HOME/harmoniq"
  REPO="$HOME/harmoniq"
fi

cd "$REPO"
echo "    Using repo: $REPO"

# 4. Install functions dependencies ------------------------------------------
echo ""
echo "==> Installing functions dependencies (needed for the TypeScript build)…"
npm --prefix "$REPO/functions" install

# 5. Set the OpenAI key -------------------------------------------------------
echo ""
echo "==> Setting the OpenAI key."
echo "    When it asks 'Enter a value for OPENAI_API_KEY', paste your key and press Enter."
echo "    (Get a fresh key at https://platform.openai.com/api-keys — revoke any old ones.)"
echo ""
firebase functions:secrets:set OPENAI_API_KEY

# 6. Deploy -------------------------------------------------------------------
echo ""
echo "==> Deploying functions… (this can take a couple minutes)"
npm --prefix "$REPO/functions" run deploy

echo ""
echo "==> Done! Open https://harmoniqs.vercel.app → Library → tap any song."
echo "    The 'About this song' card should fill in within a few seconds."
echo ""
echo "Optional: to enable CCLI SongSelect lyrics, set these secrets and redeploy:"
echo "    firebase functions:secrets:set CCLI_CLIENT_ID"
echo "    firebase functions:secrets:set CCLI_CLIENT_SECRET"
echo "    npm --prefix \"\$REPO/functions\" run deploy"
echo "See DEPLOY.md for full CCLI setup instructions."
echo ""
