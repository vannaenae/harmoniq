import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { FileText, Upload, X, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { PageHeader } from '@/components/ui/PageHeader'
import { SongMediaUpload, type SongMediaKind } from '@/components/SongMediaUpload'
import { storage } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { addCustomSong, GENRES, ALL_KEYS } from '@/lib/songs'
import type { SongGenre, RightsStatus } from '@/types'

const RIGHTS_OPTIONS: { value: RightsStatus; label: string }[] = [
  { value: 'unknown', label: 'Rights unknown' },
  { value: 'public_domain', label: 'Public domain' },
  { value: 'ccli_required', label: 'CCLI required' },
  { value: 'royalty_free', label: 'Royalty free' },
  { value: 'unlicensed', label: 'Unlicensed' },
]

const SATB_VOICES = ['soprano', 'alto', 'tenor', 'bass'] as const

export function AddCustomSong() {
  const navigate = useNavigate()
  const { firebaseUser } = useAuth()
  const { choir } = useChoir()
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [defaultKey, setDefaultKey] = useState('')
  const [genre, setGenre] = useState<SongGenre>('Other')
  const [lyricsUrl, setLyricsUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [pdf, setPdf] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Media URLs (uploaded via SongMediaUpload before save)
  const [sheetMusicUrl, setSheetMusicUrl] = useState<string | undefined>()
  const [leadSheetUrl, setLeadSheetUrl] = useState<string | undefined>()
  const [satbUrls, setSatbUrls] = useState<Record<string, string>>({})
  const [showSatb, setShowSatb] = useState(false)

  // Rights / licensing
  const [rightsStatus, setRightsStatus] = useState<RightsStatus>('unknown')
  const [publisher, setPublisher] = useState('')
  const [ccliNumber, setCcliNumber] = useState('')

  const choirHasAttestedCcli = Boolean(
    choir?.licensing?.attested && choir.licensing.ccliNumber?.trim(),
  )
  const uploadsBlocked = rightsStatus === 'ccli_required' && !choirHasAttestedCcli

  // We need a temp songId for storage paths before the song doc exists
  const [tempSongId] = useState(() => `custom-${Date.now()}`)

  const handleSave = async () => {
    if (!choir || !firebaseUser) return
    if (!title.trim()) { setError('Please give the song a title.'); return }
    setError(null)
    setSaving(true)
    try {
      let chordChartUrl: string | undefined
      if (pdf) {
        const fRef = storageRef(storage, `choirs/${choir.id}/songMedia/${tempSongId}/chord_chart.pdf`)
        await uploadBytes(fRef, pdf)
        chordChartUrl = await getDownloadURL(fRef)
      }

      // Build SATB parts array
      const satbParts = Object.keys(satbUrls).length > 0
        ? SATB_VOICES
            .filter(v => satbUrls[v])
            .map(v => ({ voice: v, audioUrl: satbUrls[v] }))
        : undefined

      await addCustomSong(choir.id, firebaseUser.uid, {
        title: title.trim(),
        artist: artist.trim() || undefined,
        defaultKey: defaultKey || undefined,
        genre,
        lyricsUrl: lyricsUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        sheetMusicUrl: uploadsBlocked ? undefined : sheetMusicUrl,
        chordChartUrl: uploadsBlocked ? undefined : chordChartUrl,
        leadSheetUrl: uploadsBlocked ? undefined : leadSheetUrl,
        satbParts: uploadsBlocked ? undefined : satbParts,
        rights: {
          status: rightsStatus,
          publisher: publisher.trim() || undefined,
          ccliNumber: ccliNumber.trim() || undefined,
        },
      })
      navigate('/library')
    } catch (err) {
      console.error('Add custom song error:', err)
      setError('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        <PageHeader title="Add a custom song" subtitle="Saved to your choir's library" back="/library" />

        <Card className="p-6 flex flex-col gap-5">
          {error && (
            <div role="alert" className="bg-red-50 border border-harmonic-danger/20 rounded-xl px-4 py-3 text-sm text-harmonic-danger">
              {error}
            </div>
          )}

          <Input label="Song title" placeholder="e.g. How Great Is Our God" value={title} onChange={e => setTitle(e.target.value)} required />
          <Input label="Artist name" placeholder="e.g. Chris Tomlin" value={artist} onChange={e => setArtist(e.target.value)} />

          <div className="grid grid-cols-2 gap-4">
            <Select label="Default key" value={defaultKey} onValueChange={setDefaultKey}
              options={[{ value: '', label: 'Not set' }, ...ALL_KEYS.map(k => ({ value: k, label: k }))]} placeholder="Key" />
            <Select label="Genre" value={genre} onValueChange={v => setGenre(v as SongGenre)}
              options={GENRES.map(g => ({ value: g, label: g }))} placeholder="Genre" />
          </div>

          <Input label="Lyrics URL (optional)" placeholder="https://genius.com/…" value={lyricsUrl} onChange={e => setLyricsUrl(e.target.value)} />
          <Textarea label="Notes (optional)" placeholder="Arrangement notes, key changes, who usually leads…" value={notes} onChange={e => setNotes(e.target.value)} />

          {/* Rights / licensing */}
          <div className="grid grid-cols-1 gap-4">
            <Select
              label="Rights status"
              value={rightsStatus}
              onValueChange={v => setRightsStatus(v as RightsStatus)}
              options={RIGHTS_OPTIONS}
              placeholder="Rights"
            />
            {(rightsStatus === 'ccli_required' || rightsStatus === 'unlicensed') && (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Publisher (optional)" placeholder="e.g. Capitol CMG" value={publisher} onChange={e => setPublisher(e.target.value)} />
                <Input label="Song CCLI # (optional)" placeholder="e.g. 4779872" value={ccliNumber} onChange={e => setCcliNumber(e.target.value)} inputMode="numeric" />
              </div>
            )}
            {uploadsBlocked && (
              <div role="alert" className="flex items-start gap-3 p-4 rounded-card bg-harmonic-warning/5 border border-harmonic-warning/20">
                <AlertTriangle size={18} className="text-harmonic-warning shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-harmonic-text">Sheet music upload blocked</p>
                  <p className="text-xs text-harmonic-muted mt-1">
                    This song requires a CCLI licence. Hosting sheet music, lead sheets, or SATB audio is disabled until a
                    director attests a CCLI licence in <span className="font-medium">Settings → Choir → Library licensing</span>.
                    You can still save the song with a lyrics link-out.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Legacy chord chart PDF (keep for backwards compat) */}
          <div className={`flex flex-col gap-1.5 ${uploadsBlocked ? 'opacity-50 pointer-events-none' : ''}`} aria-disabled={uploadsBlocked}>
            <span className="text-sm font-medium text-harmonic-text">Chord chart PDF (optional)</span>
            {pdf ? (
              <div className="flex items-center gap-3 bg-harmonic-surface rounded-2xl px-4 py-3">
                <FileText size={18} className="text-harmonic-primary flex-shrink-0" aria-hidden="true" />
                <span className="text-sm text-harmonic-text truncate flex-1">{pdf.name}</span>
                <button onClick={() => setPdf(null)} aria-label="Remove PDF" className="text-harmonic-muted hover:text-harmonic-danger min-w-[32px] min-h-[32px] flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center gap-2 bg-harmonic-surface border-2 border-dashed border-harmonic-border rounded-2xl px-4 py-5 text-sm text-harmonic-muted hover:border-harmonic-primary/40 transition-colors min-h-[44px]"
              >
                <Upload size={16} aria-hidden="true" /> Upload chord chart
              </button>
            )}
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
              onChange={e => setPdf(e.target.files?.[0] ?? null)} aria-hidden="true" />
          </div>

          {/* Additional sheet music uploads */}
          {choir && !uploadsBlocked && (
            <>
              <SongMediaUpload
                kind="sheet_music"
                choirId={choir.id}
                songId={tempSongId}
                existingUrl={sheetMusicUrl}
                onUploaded={setSheetMusicUrl}
                onRemoved={() => setSheetMusicUrl(undefined)}
              />
              <SongMediaUpload
                kind="lead_sheet"
                choirId={choir.id}
                songId={tempSongId}
                existingUrl={leadSheetUrl}
                onUploaded={setLeadSheetUrl}
                onRemoved={() => setLeadSheetUrl(undefined)}
              />

              {/* SATB audio uploads (collapsible) */}
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setShowSatb(!showSatb)}
                  className="flex items-center gap-2 text-sm font-medium text-harmonic-text hover:text-harmonic-primary transition-colors"
                >
                  {showSatb ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  SATB practice audio (optional)
                </button>

                {showSatb && (
                  <div className="space-y-3 pl-2 border-l-2 border-harmonic-border">
                    {SATB_VOICES.map(voice => (
                      <SongMediaUpload
                        key={voice}
                        kind={`satb_${voice}` as SongMediaKind}
                        choirId={choir.id}
                        songId={tempSongId}
                        existingUrl={satbUrls[voice]}
                        onUploaded={url => setSatbUrls(prev => ({ ...prev, [voice]: url }))}
                        onRemoved={() => setSatbUrls(prev => { const n = { ...prev }; delete n[voice]; return n })}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={handleSave} disabled={!title.trim() || saving}>
              {saving ? 'Saving…' : 'Save to library'}
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
