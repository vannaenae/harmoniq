import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { FileText, Upload, X } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { PageHeader } from '@/components/ui/PageHeader'
import { storage } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { addCustomSong, GENRES, ALL_KEYS } from '@/lib/songs'
import type { SongGenre } from '@/types'

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

  const handleSave = async () => {
    if (!choir || !firebaseUser) return
    if (!title.trim()) { setError('Please give the song a title.'); return }
    setError(null)
    setSaving(true)
    try {
      let sheetMusicUrl: string | undefined
      if (pdf) {
        /* API_POINT: Firebase Storage — chord chart PDF upload */
        const fRef = storageRef(storage, `choirs/${choir.id}/charts/${Date.now()}-${pdf.name}`)
        await uploadBytes(fRef, pdf)
        sheetMusicUrl = await getDownloadURL(fRef)
      }
      await addCustomSong(choir.id, firebaseUser.uid, {
        title: title.trim(),
        artist: artist.trim() || undefined,
        defaultKey: defaultKey || undefined,
        genre,
        lyricsUrl: lyricsUrl.trim() || undefined,
        notes: notes.trim() || undefined,
        sheetMusicUrl,
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

          {/* Chord chart PDF */}
          <div className="flex flex-col gap-1.5">
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
