import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Search, Trash2, Music2, X } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { PageHeader } from '@/components/ui/PageHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { getService, getSetList, saveSetList } from '@/lib/firestore'
import { subscribeSongs } from '@/lib/songs'
import { generateId } from '@/lib/utils'
import { SuggestionsRail } from '@/components/suggestions/SuggestionsRail'
import type { SetListItem, Service, Song } from '@/types'

export function SetListBuilder() {
  const { serviceId } = useParams<{ serviceId: string }>()
  const navigate = useNavigate()
  const { firebaseUser } = useAuth()
  const { choir, members, isDirector } = useChoir()

  const [service, setService] = useState<Service | null>(null)
  const [items, setItems] = useState<SetListItem[]>([])
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    if (!choir || !serviceId) return
    let active = true
    setLoading(true)
    Promise.all([getService(choir.id, serviceId), getSetList(choir.id, serviceId)])
      .then(([svc, list]) => {
        if (!active) return
        setService(svc)
        setItems(list)
      })
      .catch(err => console.error('Load set list error:', err))
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [choir, serviceId])

  // Real-time song library subscription
  useEffect(() => {
    if (!choir) return
    const unsub = subscribeSongs(choir.id, setSongs)
    return unsub
  }, [choir])

  const memberOptions = [
    { value: '', label: 'Unassigned' },
    ...members.map(m => ({ value: m.uid, label: m.preferredName || m.displayName })),
  ]

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setItems(prev => {
        const oldIdx = prev.findIndex(i => i.songId === active.id)
        const newIdx = prev.findIndex(i => i.songId === over.id)
        return arrayMove(prev, oldIdx, newIdx).map((it, idx) => ({ ...it, order: idx }))
      })
    }
  }

  const addSong = (song: Song) => {
    setItems(prev => [
      ...prev,
      {
        songId: song.id,
        title: song.title,
        artist: song.artist,
        key: song.defaultKey,
        leadVocalist: '',
        notes: '',
        order: prev.length,
      },
    ])
    setSearchOpen(false)
  }

  const addCustomSong = (title: string, artist: string) => {
    setItems(prev => [
      ...prev,
      {
        songId: `custom-${generateId()}`,
        title,
        artist: artist || undefined,
        key: '',
        leadVocalist: '',
        notes: '',
        order: prev.length,
      },
    ])
    setSearchOpen(false)
  }

  const updateItem = (songId: string, patch: Partial<SetListItem>) => {
    setItems(prev => prev.map(i => (i.songId === songId ? { ...i, ...patch } : i)))
  }

  const removeItem = (songId: string) => {
    setItems(prev => prev.filter(i => i.songId !== songId).map((it, idx) => ({ ...it, order: idx })))
  }

  const handleSave = async (publish: boolean) => {
    if (!choir || !serviceId || !firebaseUser) return
    setSaving(true)
    try {
      await saveSetList(choir.id, serviceId, items)
      if (publish) {
        const { updateService } = await import('@/lib/firestore')
        await updateService(choir.id, serviceId, { status: 'published' })

        /* API_POINT: Notifications — let members know the service + set list is live. */
        const { broadcastNotification } = await import('@/lib/notifications')
        const recipients = members.filter(m => m.uid !== firebaseUser.uid).map(m => m.uid)
        if (recipients.length) {
          await broadcastNotification(
            choir.id,
            recipients,
            'service_update',
            'A service was published',
            `${service?.title ?? 'A service'} is ready — check the set list and mark your availability.`,
            `/services/${serviceId}`,
          )
        }
      }
      navigate(`/services/${serviceId}`)
    } catch (err) {
      console.error('Save set list error:', err)
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        <PageHeader
          title="Set list"
          subtitle={service?.title}
          back="/services"
          actions={
            <>
              <Button variant="outlined" size="sm" onClick={() => handleSave(false)} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleSave(true)} disabled={saving}>
                Publish
              </Button>
            </>
          }
        />

        <Button variant="secondary" fullWidth onClick={() => setSearchOpen(true)} className="mb-5">
          <Plus size={16} /> Add song
        </Button>

        {isDirector && service && !loading && (
          <SuggestionsRail
            choirId={choir!.id}
            choirName={choir!.name}
            serviceDate={service.date instanceof Date ? service.date.toISOString() : String(service.date)}
            serviceType={service.serviceType}
            theme={service.theme}
            scriptureRef={service.scriptureRef}
            existingSongIds={items.map(i => i.songId)}
            songs={songs}
            onAddSong={addSong}
          />
        )}

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full rounded-card" />
            <Skeleton className="h-24 w-full rounded-card" />
          </div>
        ) : items.length === 0 ? (
          <Card className="p-2">
            <EmptyState
              icon={Music2}
              title="No songs yet"
              description="Add songs from the library, or drop in a custom one, then drag to set the running order."
            />
          </Card>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.songId)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-3">
                {items.map((item, idx) => (
                  <SortableSongRow
                    key={item.songId}
                    item={item}
                    index={idx}
                    memberOptions={memberOptions}
                    onUpdate={updateItem}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <AddSongModal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        songs={songs}
        onPick={addSong}
        onCustom={addCustomSong}
      />
    </AppLayout>
  )
}

function SortableSongRow({
  item,
  index,
  memberOptions,
  onUpdate,
  onRemove,
}: {
  item: SetListItem
  index: number
  memberOptions: { value: string; label: string }[]
  onUpdate: (songId: string, patch: Partial<SetListItem>) => void
  onRemove: (songId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.songId,
  })

  return (
    <Card
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`p-4 ${isDragging ? 'opacity-60 shadow-card-hover' : ''}`}
    >
      <div className="flex items-start gap-3">
        <button
          {...attributes}
          {...listeners}
          aria-label={`Reorder ${item.title}, currently position ${index + 1}`}
          className="mt-1 text-harmonic-muted hover:text-harmonic-text cursor-grab active:cursor-grabbing touch-none min-w-[32px] min-h-[32px] flex items-center justify-center -ml-2"
        >
          <GripVertical size={18} aria-hidden="true" />
        </button>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-harmonic-text truncate">
                {index + 1}. {item.title}
              </p>
              {item.artist && <p className="text-xs text-harmonic-muted">{item.artist}</p>}
            </div>
            <button
              onClick={() => onRemove(item.songId)}
              aria-label={`Remove ${item.title} from set list`}
              className="text-harmonic-muted hover:text-harmonic-danger transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center flex-shrink-0"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              aria-label={`Key for ${item.title}`}
              placeholder="Key"
              value={item.key ?? ''}
              onChange={e => onUpdate(item.songId, { key: e.target.value })}
              className="bg-white"
            />
            <Select
              ariaLabel={`Lead vocalist for ${item.title}`}
              value={item.leadVocalist || ''}
              onValueChange={v => onUpdate(item.songId, { leadVocalist: v })}
              options={memberOptions}
              placeholder="Lead vocalist"
              className="bg-white"
            />
          </div>

          <Input
            aria-label={`Notes for ${item.title}`}
            placeholder="Notes for the team (optional)"
            value={item.notes ?? ''}
            onChange={e => onUpdate(item.songId, { notes: e.target.value })}
            className="bg-white"
          />
        </div>
      </div>
    </Card>
  )
}

function AddSongModal({
  open,
  onOpenChange,
  songs,
  onPick,
  onCustom,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  songs: Song[]
  onPick: (song: Song) => void
  onCustom: (title: string, artist: string) => void
}) {
  const [q, setQ] = useState('')
  const [customMode, setCustomMode] = useState(false)
  const [customTitle, setCustomTitle] = useState('')
  const [customArtist, setCustomArtist] = useState('')

  const term = q.trim().toLowerCase()
  const results = term
    ? songs.filter(s => s.title.toLowerCase().includes(term) || (s.artist ?? '').toLowerCase().includes(term))
    : songs

  return (
    <Modal
      open={open}
      onOpenChange={(o) => { onOpenChange(o); if (!o) { setQ(''); setCustomMode(false) } }}
      title="Add a song"
      description="Search the library or add a custom song."
    >
      {!customMode ? (
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-harmonic-muted" aria-hidden="true" />
            <Input
              aria-label="Search songs"
              placeholder="Search by title or artist"
              value={q}
              onChange={e => setQ(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* API_POINT: Spotify/Genius — Phase 4 replaces these mock results
              with real library search + artwork. */}
          <div className="max-h-72 overflow-y-auto -mx-1 px-1 space-y-1">
            {results.map(song => (
              <button
                key={song.id}
                onClick={() => onPick(song)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-harmonic-surface transition-colors text-left min-h-[44px]"
              >
                <span className="w-9 h-9 rounded-lg bg-harmonic-surface flex items-center justify-center flex-shrink-0">
                  <Music2 size={16} className="text-harmonic-primary" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-harmonic-text truncate">{song.title}</p>
                  <p className="text-xs text-harmonic-muted truncate">
                    {song.artist} · {song.defaultKey}
                  </p>
                </div>
              </button>
            ))}
            {results.length === 0 && (
              <p className="text-sm text-harmonic-muted text-center py-6">
                No matches. Try a custom song instead.
              </p>
            )}
          </div>

          <Button variant="outlined" fullWidth onClick={() => setCustomMode(true)}>
            <Plus size={16} /> Add custom song
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={() => setCustomMode(false)}
            className="text-sm text-harmonic-primary font-medium flex items-center gap-1 hover:opacity-80"
          >
            <X size={14} /> Back to search
          </button>
          <Input label="Song title" placeholder="e.g. How Great Is Our God" value={customTitle} onChange={e => setCustomTitle(e.target.value)} autoFocus />
          <Input label="Artist (optional)" placeholder="e.g. Chris Tomlin" value={customArtist} onChange={e => setCustomArtist(e.target.value)} />
          <Button
            variant="primary"
            fullWidth
            disabled={!customTitle.trim()}
            onClick={() => { onCustom(customTitle.trim(), customArtist.trim()); setCustomTitle(''); setCustomArtist('') }}
          >
            Add to set list
          </Button>
        </div>
      )}
    </Modal>
  )
}
