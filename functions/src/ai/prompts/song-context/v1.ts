/**
 * Song context prompt — v1
 * Generates a structured knowledge card for a worship song.
 */
export const PROMPT_VERSION = 'song-context/v1'

export function buildPrompt(title: string, artist?: string): string {
  const songLabel = artist ? `"${title}" by ${artist}` : `"${title}"`
  return `You are a music expert specializing in worship and gospel music. Provide a concise knowledge card for the song ${songLabel}.

Return ONLY a JSON object with exactly these fields:
{
  "about": "2-3 sentences describing what this song is about — its story, meaning, and emotional core",
  "themes": ["Theme1", "Theme2", "Theme3"],
  "resonance": "One sentence on why this song deeply connects with listeners or congregations"
}

If you don't know the song, make a reasonable inference from the title and artist. Return ONLY valid JSON.`
}
