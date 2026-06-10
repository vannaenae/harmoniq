import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@harmoniq/shared'
import { transposeChordLine, type AccidentalPreference } from '@harmoniq/shared'
import type { Language, LyricSection, SongTranslation } from '@harmoniq/shared'

// ── Section heading labels ──────────────────────────────────────────────────

function sectionHeading(s: LyricSection): string {
  const labels: Record<LyricSection['kind'], string> = {
    verse: 'Verse',
    chorus: 'Chorus',
    pre_chorus: 'Pre-Chorus',
    bridge: 'Bridge',
    tag: 'Tag',
    refrain: 'Refrain',
    intro: 'Intro',
    outro: 'Outro',
    interlude: 'Interlude',
  }
  const base = labels[s.kind] ?? s.kind
  return s.number ? `${base} ${s.number}` : base
}

// ── Font scale ──────────────────────────────────────────────────────────────

type FontScale = 'S' | 'M' | 'L'

const SCALE_CLASSES: Record<FontScale, { text: string; chord: string; heading: string }> = {
  S: { text: 'text-xs leading-5',  chord: 'text-[11px]', heading: 'text-xs' },
  M: { text: 'text-sm leading-7',  chord: 'text-xs',     heading: 'text-sm' },
  L: { text: 'text-base leading-8', chord: 'text-sm',    heading: 'text-base' },
}

// ── Props ───────────────────────────────────────────────────────────────────

interface LyricSheetProps {
  sections: LyricSection[]
  translations?: (Pick<SongTranslation, 'language' | 'sections' | 'translator' | 'reviewedBy'>)[]
  languageOverride?: Language
  showChords?: boolean
  transposeDelta?: number
  accidentalPreference?: AccidentalPreference
  fontScale?: FontScale
  autoScroll?: boolean
  className?: string
}

// ── Component ───────────────────────────────────────────────────────────────

export function LyricSheet({
  sections,
  translations,
  languageOverride,
  showChords = true,
  transposeDelta = 0,
  accidentalPreference = 'sharp',
  fontScale = 'M',
  autoScroll = false,
  className,
}: LyricSheetProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTimerRef = useRef<number | null>(null)

  // Resolve which sections to render based on language
  const activeSections = resolveSections(sections, translations, languageOverride)
  const scale = SCALE_CLASSES[fontScale]

  // Auto-scroll
  useEffect(() => {
    if (!autoScroll || !containerRef.current) {
      if (scrollTimerRef.current) cancelAnimationFrame(scrollTimerRef.current)
      return
    }
    const el = containerRef.current
    const speed = 0.5 // px per frame (~30 px/sec at 60fps)
    const tick = () => {
      el.scrollTop += speed
      if (el.scrollTop < el.scrollHeight - el.clientHeight) {
        scrollTimerRef.current = requestAnimationFrame(tick)
      }
    }
    scrollTimerRef.current = requestAnimationFrame(tick)
    return () => {
      if (scrollTimerRef.current) cancelAnimationFrame(scrollTimerRef.current)
    }
  }, [autoScroll])

  // Language picker state
  const [selectedLang, setSelectedLang] = useState<Language | undefined>(languageOverride)
  const availableLanguages = useAvailableLanguages(sections, translations)

  useEffect(() => {
    setSelectedLang(languageOverride)
  }, [languageOverride])

  const handleLangChange = useCallback((lang: Language) => {
    setSelectedLang(lang)
  }, [])

  const displaySections = selectedLang
    ? resolveSections(sections, translations, selectedLang)
    : activeSections

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Language picker */}
      {availableLanguages.length > 1 && (
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-semibold text-harmonic-muted uppercase tracking-widest mr-1">
            Language
          </span>
          {availableLanguages.map(lang => {
            const trans = translations?.find(t => t.language === lang)
            const isAiUnreviewed = trans?.translator === 'ai' && !trans?.reviewedBy
            return (
              <button
                key={lang}
                onClick={() => handleLangChange(lang)}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                  (selectedLang ?? sections[0]?.language) === lang
                    ? 'bg-harmonic-primary text-white'
                    : 'bg-harmonic-surface text-harmonic-muted hover:bg-harmonic-border',
                )}
              >
                {lang.toUpperCase()}
                {isAiUnreviewed && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Sections */}
      <div
        ref={containerRef}
        className={cn('space-y-5', autoScroll && 'overflow-y-auto max-h-[70vh]')}
      >
        {displaySections.map((section, idx) => (
          <div key={idx}>
            {/* Section heading */}
            <p
              className={cn(
                'font-bold text-harmonic-primary uppercase tracking-widest mb-2',
                scale.heading,
              )}
            >
              {sectionHeading(section)}
            </p>

            {/* Lines */}
            <div className="space-y-0">
              {section.lines.map((line, li) => {
                const chordLine =
                  showChords && section.chordsAboveLines?.[li]
                    ? transposeChordLine(
                        section.chordsAboveLines[li],
                        transposeDelta,
                        accidentalPreference,
                      )
                    : null

                return (
                  <div key={li}>
                    {chordLine && (
                      <pre
                        className={cn(
                          'font-mono text-harmonic-primary font-semibold whitespace-pre',
                          scale.chord,
                        )}
                      >
                        {chordLine}
                      </pre>
                    )}
                    <p className={cn('text-harmonic-text whitespace-pre-wrap', scale.text)}>
                      {line}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {displaySections.length === 0 && (
          <p className="text-sm text-harmonic-muted italic">No lyrics available.</p>
        )}
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolveSections(
  primary: LyricSection[],
  translations: Pick<SongTranslation, 'language' | 'sections'>[] | undefined,
  languageOverride?: Language,
): LyricSection[] {
  if (!languageOverride) return primary
  if (primary[0]?.language === languageOverride) return primary
  const match = translations?.find(t => t.language === languageOverride)
  return match ? match.sections : primary
}

function useAvailableLanguages(
  sections: LyricSection[],
  translations?: Pick<SongTranslation, 'language' | 'sections'>[],
): Language[] {
  const langs = new Set<Language>()
  if (sections[0]?.language) langs.add(sections[0].language)
  translations?.forEach(t => langs.add(t.language))
  return Array.from(langs)
}
