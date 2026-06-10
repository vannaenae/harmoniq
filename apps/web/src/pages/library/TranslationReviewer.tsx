import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft, Check, Pencil, RotateCcw, Sparkles, AlertTriangle, Loader2,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useChoir } from '@harmoniq/shared'
import { getSong } from '@harmoniq/shared'
import {
  requestTranslation,
  approveTranslation,
  subscribeTranslationCache,
  countSyllables,
  LANGUAGE_NAMES,
} from '@harmoniq/shared'
import type { Song, Language, LyricSection, SongTranslationCache } from '@harmoniq/shared'
import { cn } from '@harmoniq/shared'

// ── Types ────────────────────────────────────────────────────────────────────

interface LineEdit {
  sectionIdx: number
  lineIdx: number
  text: string
}

type LineStatus = 'pending' | 'approved' | 'editing'

// ── Component ────────────────────────────────────────────────────────────────

export function TranslationReviewer() {
  const { songId, lang } = useParams<{ songId: string; lang: string }>()
  const { choir, isDirector } = useChoir()

  const targetLang = lang as Language

  const [song, setSong] = useState<Song | null>(null)
  const [translation, setTranslation] = useState<SongTranslationCache | null>(null)
  const [loading, setLoading] = useState(true)
  const [translating, setTranslating] = useState(false)
  const [approving, setApproving] = useState(false)
  const [retranslatingLine, setRetranslatingLine] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Per-line statuses and edits
  const [lineStatuses, setLineStatuses] = useState<Map<string, LineStatus>>(new Map())
  const [lineEdits, setLineEdits] = useState<Map<string, LineEdit>>(new Map())

  // Load song
  useEffect(() => {
    if (!choir || !songId) return
    let active = true
    getSong(choir.id, songId).then(s => {
      if (active) {
        setSong(s)
        setLoading(false)
      }
    }).catch(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [choir, songId])

  // Subscribe to translation cache (real-time)
  useEffect(() => {
    if (!songId || !targetLang) return
    return subscribeTranslationCache(songId, targetLang, cached => {
      setTranslation(cached)
      if (cached) setLoading(false)
    })
  }, [songId, targetLang])

  // Request translation if not cached
  const handleRequestTranslation = async () => {
    if (!choir || !songId) return
    setTranslating(true)
    setError(null)
    try {
      const result = await requestTranslation(songId, targetLang, choir.id)
      setTranslation(result)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Translation failed'
      setError(msg)
    } finally {
      setTranslating(false)
    }
  }

  // Re-translate a single line (triggers full re-translation, then we just use the new line)
  const handleRetranslateLine = async (sectionIdx: number, lineIdx: number) => {
    if (!choir || !songId) return
    const key = `${sectionIdx}-${lineIdx}`
    setRetranslatingLine(key)
    setError(null)
    try {
      // Clear cache and re-request — the Cloud Function will re-generate
      // For now, we re-request the full translation
      const result = await requestTranslation(songId, targetLang, choir.id)
      setTranslation(result)
      // Clear any edits for this line
      setLineEdits(prev => {
        const next = new Map(prev)
        next.delete(key)
        return next
      })
      setLineStatuses(prev => {
        const next = new Map(prev)
        next.delete(key)
        return next
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Re-translation failed'
      setError(msg)
    } finally {
      setRetranslatingLine(null)
    }
  }

  // Approve the full translation
  const handleApproveAll = async () => {
    if (!choir || !songId) return
    setApproving(true)
    setError(null)
    try {
      await approveTranslation(songId, targetLang, choir.id)
      // Translation subscription will update with reviewedBy
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Approval failed'
      setError(msg)
    } finally {
      setApproving(false)
    }
  }

  const handleLineApprove = (sectionIdx: number, lineIdx: number) => {
    const key = `${sectionIdx}-${lineIdx}`
    setLineStatuses(prev => {
      const next = new Map(prev)
      next.set(key, 'approved')
      return next
    })
  }

  const handleLineEdit = (sectionIdx: number, lineIdx: number) => {
    const key = `${sectionIdx}-${lineIdx}`
    const currentText = getTranslatedLine(sectionIdx, lineIdx)
    setLineStatuses(prev => {
      const next = new Map(prev)
      next.set(key, 'editing')
      return next
    })
    if (!lineEdits.has(key)) {
      setLineEdits(prev => {
        const next = new Map(prev)
        next.set(key, { sectionIdx, lineIdx, text: currentText })
        return next
      })
    }
  }

  const handleEditChange = (key: string, text: string) => {
    setLineEdits(prev => {
      const next = new Map(prev)
      const existing = next.get(key)
      if (existing) {
        next.set(key, { ...existing, text })
      }
      return next
    })
  }

  const handleEditConfirm = (sectionIdx: number, lineIdx: number) => {
    const key = `${sectionIdx}-${lineIdx}`
    setLineStatuses(prev => {
      const next = new Map(prev)
      next.set(key, 'approved')
      return next
    })
  }

  const getTranslatedLine = (sectionIdx: number, lineIdx: number): string => {
    const key = `${sectionIdx}-${lineIdx}`
    const edit = lineEdits.get(key)
    if (edit) return edit.text
    return translation?.sections[sectionIdx]?.lines[lineIdx] ?? ''
  }

  const getLineStatus = (sectionIdx: number, lineIdx: number): LineStatus => {
    const key = `${sectionIdx}-${lineIdx}`
    return lineStatuses.get(key) ?? 'pending'
  }

  // Section heading
  const sectionLabel = (s: LyricSection): string => {
    const labels: Record<LyricSection['kind'], string> = {
      verse: 'Verse', chorus: 'Chorus', pre_chorus: 'Pre-Chorus',
      bridge: 'Bridge', tag: 'Tag', refrain: 'Refrain',
      intro: 'Intro', outro: 'Outro', interlude: 'Interlude',
    }
    const base = labels[s.kind] ?? s.kind
    return s.number ? `${base} ${s.number}` : base
  }

  // ── Guards ──────────────────────────────────────────────────────────────────

  if (!isDirector) {
    return (
      <AppLayout>
        <div className="px-6 py-8 max-w-2xl mx-auto">
          <Card className="p-2">
            <EmptyState
              title="Director access required"
              description="Only directors can review translations."
            />
          </Card>
        </div>
      </AppLayout>
    )
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-5 py-8 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </AppLayout>
    )
  }

  if (!song) {
    return (
      <AppLayout>
        <div className="px-6 py-8 max-w-2xl mx-auto">
          <Link to="/library" className="inline-flex items-center gap-1.5 text-sm text-harmonic-muted mb-6 hover:text-harmonic-text">
            <ArrowLeft size={16} /> Library
          </Link>
          <Card className="p-2">
            <EmptyState title="Song not found" description="It may have been removed from the library." />
          </Card>
        </div>
      </AppLayout>
    )
  }

  const isApproved = !!translation?.reviewedBy
  const hasTranslation = !!translation && translation.sections.length > 0

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto pb-12">
        {/* Header */}
        <div className="px-5 py-6">
          <Link
            to={`/library/${songId}`}
            className="inline-flex items-center gap-1.5 text-sm text-harmonic-muted mb-4 hover:text-harmonic-text"
          >
            <ArrowLeft size={16} /> Back to song
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-harmonic-text">Translation Review</h1>
              <p className="text-sm text-harmonic-muted mt-1">
                {song.title} — {LANGUAGE_NAMES[targetLang] ?? targetLang.toUpperCase()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {translation?.translator === 'ai' && !isApproved && (
                <Badge tone="warning">
                  <Sparkles size={12} /> AI draft — needs review
                </Badge>
              )}
              {isApproved && (
                <Badge tone="success">
                  <Check size={12} /> Approved
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-5 mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-harmonic-danger/20 px-4 py-3 text-sm text-harmonic-danger">
            <AlertTriangle size={16} className="flex-shrink-0" />
            {error}
          </div>
        )}

        {/* No translation yet — request one */}
        {!hasTranslation && !translating && (
          <div className="px-5">
            <Card className="p-8 text-center space-y-4">
              <Sparkles size={32} className="text-harmonic-primary mx-auto" />
              <p className="text-sm text-harmonic-muted">
                No {LANGUAGE_NAMES[targetLang]} translation exists yet for this song.
              </p>
              <Button variant="primary" onClick={handleRequestTranslation}>
                <Sparkles size={15} /> Generate AI Translation
              </Button>
            </Card>
          </div>
        )}

        {/* Translating spinner */}
        {translating && (
          <div className="px-5">
            <Card className="p-8 text-center space-y-4">
              <Loader2 size={32} className="text-harmonic-primary mx-auto animate-spin" />
              <p className="text-sm text-harmonic-muted">
                Translating to {LANGUAGE_NAMES[targetLang]}…
              </p>
            </Card>
          </div>
        )}

        {/* Side-by-side editor */}
        {hasTranslation && !translating && (
          <div className="px-5 space-y-4">
            {/* Column headers (desktop) */}
            <div className="hidden sm:grid sm:grid-cols-2 gap-4 px-4">
              <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest">
                Source ({LANGUAGE_NAMES[song.primaryLanguage]})
              </p>
              <p className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest">
                Translation ({LANGUAGE_NAMES[targetLang]})
              </p>
            </div>

            {/* Sections */}
            {song.lyrics.map((section, sectionIdx) => {
              const translatedSection = translation.sections[sectionIdx]
              if (!translatedSection) return null

              return (
                <Card key={sectionIdx} className="p-4 space-y-3">
                  {/* Section heading */}
                  <p className="text-xs font-bold text-harmonic-primary uppercase tracking-widest">
                    {sectionLabel(section)}
                  </p>

                  {/* Lines */}
                  <div className="space-y-2">
                    {section.lines.map((sourceLine, lineIdx) => {
                      const key = `${sectionIdx}-${lineIdx}`
                      const translatedLine = getTranslatedLine(sectionIdx, lineIdx)
                      const status = getLineStatus(sectionIdx, lineIdx)
                      const sourceSyllables = countSyllables(sourceLine)
                      const targetSyllables = countSyllables(translatedLine)
                      const isReTranslating = retranslatingLine === key

                      return (
                        <div
                          key={key}
                          className={cn(
                            'rounded-xl border transition-colors',
                            status === 'approved'
                              ? 'border-harmonic-success/30 bg-harmonic-success/5'
                              : status === 'editing'
                              ? 'border-harmonic-primary/30 bg-harmonic-primary/5'
                              : 'border-harmonic-border bg-white',
                          )}
                        >
                          {/* Side-by-side on desktop, stacked on mobile */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-4 p-3">
                            {/* Source line */}
                            <div className="space-y-1">
                              <p className="text-sm text-harmonic-text leading-relaxed sm:hidden font-semibold text-[10px] uppercase tracking-widest text-harmonic-muted mb-0.5">
                                Source
                              </p>
                              <p className="text-sm text-harmonic-text leading-relaxed">
                                {sourceLine}
                              </p>
                              <p className="text-[10px] text-harmonic-muted">
                                {sourceSyllables} syllable{sourceSyllables !== 1 ? 's' : ''}
                              </p>
                            </div>

                            {/* Translated line */}
                            <div className="space-y-1 mt-2 sm:mt-0">
                              <p className="text-sm text-harmonic-text leading-relaxed sm:hidden font-semibold text-[10px] uppercase tracking-widest text-harmonic-muted mb-0.5">
                                Translation
                              </p>
                              {status === 'editing' ? (
                                <textarea
                                  value={lineEdits.get(key)?.text ?? translatedLine}
                                  onChange={e => handleEditChange(key, e.target.value)}
                                  rows={2}
                                  className="w-full resize-none rounded-lg bg-white border border-harmonic-primary/30 px-3 py-2 text-sm text-harmonic-text focus:outline-none focus:ring-2 focus:ring-harmonic-primary/30"
                                  autoFocus
                                />
                              ) : (
                                <p className="text-sm text-harmonic-text leading-relaxed">
                                  {translatedLine}
                                </p>
                              )}
                              <p className={cn(
                                'text-[10px]',
                                Math.abs(targetSyllables - sourceSyllables) > 2
                                  ? 'text-harmonic-warning font-medium'
                                  : 'text-harmonic-muted',
                              )}>
                                {targetSyllables} syllable{targetSyllables !== 1 ? 's' : ''}
                                {Math.abs(targetSyllables - sourceSyllables) > 2 && (
                                  <span> ({targetSyllables > sourceSyllables ? '+' : ''}{targetSyllables - sourceSyllables})</span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Per-line actions */}
                          {!isApproved && (
                            <div className="flex items-center gap-1.5 px-3 pb-2.5">
                              {status === 'editing' ? (
                                <button
                                  onClick={() => handleEditConfirm(sectionIdx, lineIdx)}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-harmonic-primary text-white hover:opacity-90 transition-all"
                                >
                                  <Check size={12} /> Done
                                </button>
                              ) : status === 'approved' ? (
                                <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-harmonic-success">
                                  <Check size={12} /> Approved
                                </span>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleLineApprove(sectionIdx, lineIdx)}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-harmonic-success/10 text-harmonic-success hover:bg-harmonic-success/20 transition-colors"
                                  >
                                    <Check size={11} /> Approve
                                  </button>
                                  <button
                                    onClick={() => handleLineEdit(sectionIdx, lineIdx)}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-harmonic-surface text-harmonic-muted hover:bg-harmonic-border transition-colors"
                                  >
                                    <Pencil size={11} /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleRetranslateLine(sectionIdx, lineIdx)}
                                    disabled={isReTranslating}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-harmonic-surface text-harmonic-muted hover:bg-harmonic-border transition-colors disabled:opacity-50"
                                  >
                                    {isReTranslating ? (
                                      <Loader2 size={11} className="animate-spin" />
                                    ) : (
                                      <RotateCcw size={11} />
                                    )}
                                    Re-translate
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )
            })}

            {/* Approve all button */}
            {!isApproved && (
              <Card className="p-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-harmonic-text">
                      Ready to approve this translation?
                    </p>
                    <p className="text-xs text-harmonic-muted mt-0.5">
                      Once approved, this version will be locked and available to all choir members.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleApproveAll}
                    disabled={approving}
                  >
                    {approving ? (
                      <><Loader2 size={15} className="animate-spin" /> Approving…</>
                    ) : (
                      <><Check size={15} /> Approve Translation</>
                    )}
                  </Button>
                </div>
              </Card>
            )}

            {/* Already approved info */}
            {isApproved && (
              <Card className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-harmonic-success/10 flex items-center justify-center flex-shrink-0">
                    <Check size={20} className="text-harmonic-success" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-harmonic-text">
                      Translation approved
                    </p>
                    <p className="text-xs text-harmonic-muted mt-0.5">
                      This translation has been reviewed and is locked for use.
                      To create a new version, request a new translation.
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
