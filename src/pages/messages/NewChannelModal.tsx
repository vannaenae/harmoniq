import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { NewChannelInput } from '@/lib/messaging'
import type { ChannelVisibility } from '@/types'

interface Props {
  onClose: () => void
  onCreate: (input: NewChannelInput) => Promise<void>
}

const VISIBILITY_OPTIONS: { value: ChannelVisibility; label: string }[] = [
  { value: 'all',              label: 'Everyone' },
  { value: 'vocalists',        label: 'Vocalists only' },
  { value: 'instrumentalists', label: 'Instrumentalists only' },
  { value: 'directors',        label: 'Directors only' },
]

const CATEGORY_OPTIONS: { value: NewChannelInput['category']; label: string }[] = [
  { value: 'general',       label: 'General' },
  { value: 'sections',      label: 'Sections' },
  { value: 'planning',      label: 'Planning' },
  { value: 'announcements', label: 'Announcements' },
]

export function NewChannelModal({ onClose, onCreate }: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<NewChannelInput['category']>('general')
  const [visibleTo, setVisibleTo] = useState<ChannelVisibility>('all')
  const [directorOnly, setDirectorOnly] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onCreate({ name: name.trim().toLowerCase().replace(/\s+/g, '-'), description: description.trim() || undefined, category, visibleTo, directorOnly })
      onClose()
    } catch (err) {
      console.error('Create channel error:', err)
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-card-lg border border-black/[0.06] shadow-pop w-full max-w-md p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-harmonic-text">Create a channel</h2>
          <button onClick={onClose} aria-label="Close" className="text-harmonic-muted hover:text-harmonic-text">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <Input
            label="Channel name"
            placeholder="e.g. sopranos"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <Input
            label="Description (optional)"
            placeholder="What's this channel for?"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setCategory(opt.value)}
                  className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150 text-left active:scale-[0.98] ${
                    category === opt.value
                      ? 'border-harmonic-primary bg-harmonic-primary/5 text-harmonic-primary'
                      : 'border-harmonic-border text-harmonic-text hover:border-harmonic-primary/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-2">
              Visible to
            </label>
            <div className="flex flex-col gap-1.5">
              {VISIBILITY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setVisibleTo(opt.value)}
                  className={`px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150 text-left active:scale-[0.98] ${
                    visibleTo === opt.value
                      ? 'border-harmonic-primary bg-harmonic-primary/5 text-harmonic-primary'
                      : 'border-harmonic-border text-harmonic-text hover:border-harmonic-primary/40'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={directorOnly}
              onChange={e => setDirectorOnly(e.target.checked)}
              className="w-4 h-4 accent-harmonic-primary"
            />
            <span className="text-sm text-harmonic-text">Only directors can post</span>
          </label>
        </div>

        <div className="flex gap-2 justify-end mt-6">
          <Button variant="outlined" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!name.trim() || saving}>
            {saving ? 'Creating…' : 'Create channel'}
          </Button>
        </div>
      </div>
    </div>
  )
}
