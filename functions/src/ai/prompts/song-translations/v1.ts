/**
 * Song Translation prompt — v1
 *
 * Translates worship song lyrics while preserving section structure,
 * scripture references, and proper nouns. Designed for worship-faithful
 * translations across African and global languages.
 */

export type Language = 'en' | 'yo' | 'ig' | 'ha' | 'pcm' | 'fr' | 'sw' | 'pt' | 'la' | 'other'

export const SUPPORTED_TRANSLATION_LANGUAGES: Language[] = ['yo', 'ig', 'ha', 'fr', 'sw', 'pt']

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  yo: 'Yoruba',
  ig: 'Igbo',
  ha: 'Hausa',
  pcm: 'Nigerian Pidgin',
  fr: 'French',
  sw: 'Swahili',
  pt: 'Portuguese',
  la: 'Latin',
  other: 'Other',
}

export interface LyricSectionInput {
  kind: string
  number?: number
  lines: string[]
  language: string
}

export function buildTranslationPrompt(
  title: string,
  artist: string | undefined,
  sections: LyricSectionInput[],
  targetLanguage: Language,
): string {
  const targetName = LANGUAGE_NAMES[targetLanguage]
  const songLabel = artist ? `"${title}" by ${artist}` : `"${title}"`

  const sectionBlock = sections
    .map((s, i) => {
      const label = s.number ? `${s.kind} ${s.number}` : s.kind
      return `[Section ${i + 1}: ${label}]\n${s.lines.join('\n')}`
    })
    .join('\n\n')

  return `You are a worship music translator specializing in ${targetName}. Translate the lyrics of ${songLabel} into ${targetName}.

LYRICS TO TRANSLATE:
${sectionBlock}

RULES:
1. PRESERVE SECTION STRUCTURE EXACTLY: Output the same number of sections in the same order, with the same section types (verse, chorus, bridge, etc.) and section numbers.
2. SCRIPTURE REFERENCES: Keep all scripture references (e.g. "Psalm 23:1", "John 3:16") in their original form. Do NOT translate book names or verse numbers.
3. PROPER NOUNS: Retain or transliterate divine names and proper nouns: "Jehovah", "Jesus", "Christ", "Emmanuel", "Olorun", "Chukwu", "Chineke", "Ubangiji", "Yesu". Use the culturally appropriate form in ${targetName} where one is well-established (e.g. "Yesu" in Yoruba/Swahili for "Jesus").
4. WORSHIP FAITHFULNESS: Maintain the devotional intent, emotional tone, and theological meaning. Prioritize singability and natural phrasing in ${targetName} over word-for-word accuracy.
5. LINE COUNT: Try to match the original line count per section for singability, though minor variation is acceptable.

OUTPUT FORMAT (strict JSON, no markdown fences):
[
  {
    "kind": "<section type from original>",
    "number": <section number or null>,
    "lines": ["<translated line 1>", "<translated line 2>", ...],
    "language": "${targetLanguage}"
  }
]

RULES:
- Output EXACTLY ${sections.length} section objects.
- Each section must have the same "kind" and "number" as the corresponding input section.
- Respond with ONLY the JSON array, nothing else.`
}

/**
 * Parse and validate the translation output from the LLM.
 * Ensures section count and structure match the input.
 */
export interface TranslatedSection {
  kind: string
  number: number | null
  lines: string[]
  language: string
}

export function parseTranslationOutput(
  raw: string,
  expectedSectionCount: number,
): TranslatedSection[] | null {
  const cleaned = raw.replace(/```json?\s*/g, '').replace(/```/g, '').trim()

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    return null
  }

  if (!Array.isArray(parsed)) return null

  const sections = (parsed as Array<Record<string, unknown>>)
    .filter(
      item =>
        typeof item.kind === 'string' &&
        Array.isArray(item.lines) &&
        (item.lines as unknown[]).every(l => typeof l === 'string') &&
        typeof item.language === 'string',
    )
    .map(item => ({
      kind: item.kind as string,
      number: typeof item.number === 'number' ? item.number : null,
      lines: item.lines as string[],
      language: item.language as string,
    }))

  // Section count must match
  if (sections.length !== expectedSectionCount) return null

  return sections
}
