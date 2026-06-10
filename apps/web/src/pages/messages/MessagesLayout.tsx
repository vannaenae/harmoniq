import { useEffect, useState } from 'react'
import { useNavigate, useParams, Outlet } from 'react-router-dom'
import { Hash, Plus, Settings, ChevronDown, ChevronRight, MessageSquare } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@harmoniq/shared'
import { useAuth } from '@harmoniq/shared'
import { useChoir } from '@harmoniq/shared'
import { subscribeToChannels, seedDefaultChannels, createChannel } from '@harmoniq/shared'
import { NewChannelModal } from './NewChannelModal'
import type { Channel, VoicePart } from '@harmoniq/shared'

const VOCALIST_PARTS: VoicePart[] = ['soprano', 'alto', 'tenor', 'bass', 'unclassified']
const INSTRUMENTALIST_PARTS: VoicePart[] = ['keys', 'guitar', 'bass_guitar', 'drums', 'other_instrument']

function isVocalist(part: VoicePart) { return VOCALIST_PARTS.includes(part) }
function isInstrumentalist(part: VoicePart) { return INSTRUMENTALIST_PARTS.includes(part) }

export function visibleChannels(
  channels: Channel[],
  role: 'director' | 'member',
  voicePart: VoicePart,
): Channel[] {
  return channels.filter(ch => {
    if (ch.visibleTo === 'all') return true
    if (ch.visibleTo === 'directors') return role === 'director'
    if (ch.visibleTo === 'vocalists') return role === 'director' || isVocalist(voicePart)
    if (ch.visibleTo === 'instrumentalists') return role === 'director' || isInstrumentalist(voicePart)
    return false
  })
}

const CATEGORY_LABELS: Record<string, string> = {
  general:      'General',
  sections:     'Sections',
  planning:     'Planning',
  announcements:'Announcements',
}

export function MessagesLayout() {
  const { channelId } = useParams<{ channelId?: string }>()
  const navigate = useNavigate()
  const { harmonicUser } = useAuth()
  const { choir, isDirector } = useChoir()

  const [channels, setChannels] = useState<Channel[]>([])
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [showNewModal, setShowNewModal] = useState(false)

  const role = harmonicUser?.role ?? 'member'
  const voicePart = harmonicUser?.voicePart ?? 'unclassified'

  useEffect(() => {
    if (!choir) return
    seedDefaultChannels(choir.id, harmonicUser?.uid ?? '').catch(() => {})
    const unsub = subscribeToChannels(choir.id, setChannels)
    return unsub
  }, [choir, harmonicUser?.uid])

  // Auto-navigate to first visible channel
  useEffect(() => {
    if (!channelId && channels.length > 0) {
      const visible = visibleChannels(channels, role as 'director' | 'member', voicePart)
      if (visible.length > 0) navigate(`/messages/${visible[0].id}`, { replace: true })
    }
  }, [channels, channelId, role, voicePart, navigate])

  const visible = visibleChannels(channels, role as 'director' | 'member', voicePart)

  const grouped = visible.reduce<Record<string, Channel[]>>((acc, ch) => {
    if (!acc[ch.category]) acc[ch.category] = []
    acc[ch.category].push(ch)
    return acc
  }, {})

  const handleCreateChannel = async (input: Parameters<typeof createChannel>[1]) => {
    if (!choir || !harmonicUser) return
    const id = await createChannel(choir.id, input, harmonicUser.uid)
    navigate(`/messages/${id}`)
  }

  return (
    <AppLayout hidePadding>
      <div className="flex h-[calc(100vh-4rem)] md:h-screen overflow-hidden">

        {/* Sidebar — channel list */}
        <aside className="w-60 flex-shrink-0 bg-harmonic-neutral flex flex-col overflow-y-auto hidden md:flex">
          {/* Header */}
          <div className="px-4 py-4 border-b border-white/10">
            <p className="font-bold text-white text-sm truncate">{choir?.name ?? 'Messages'}</p>
            <p className="text-white/50 text-xs mt-0.5">{choir?.churchName ?? ''}</p>
          </div>

          {/* Channel groups */}
          <nav className="flex-1 px-2 py-3" aria-label="Channels">
            {Object.entries(grouped).map(([category, chs]) => (
              <div key={category} className="mb-4">
                <button
                  className="w-full flex items-center gap-1 px-2 py-1 text-white/60 text-xs font-semibold uppercase tracking-wider hover:text-white/80 transition-colors"
                  onClick={() => setCollapsed(p => ({ ...p, [category]: !p[category] }))}
                  aria-expanded={!collapsed[category]}
                >
                  {collapsed[category]
                    ? <ChevronRight size={12} aria-hidden="true" />
                    : <ChevronDown size={12} aria-hidden="true" />
                  }
                  {CATEGORY_LABELS[category] ?? category}
                </button>

                {!collapsed[category] && chs.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => navigate(`/messages/${ch.id}`)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-left',
                      channelId === ch.id
                        ? 'bg-white/20 text-white'
                        : 'text-white/60 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <Hash size={14} aria-hidden="true" className="flex-shrink-0" />
                    <span className="truncate">{ch.name}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>

          {/* Add channel — directors only */}
          {isDirector && (
            <div className="px-4 py-3 border-t border-white/10">
              <button
                onClick={() => setShowNewModal(true)}
                className="flex items-center gap-2 text-white/60 hover:text-white text-xs font-medium transition-colors"
              >
                <Plus size={14} aria-hidden="true" />
                Add channel
              </button>
            </div>
          )}

          {/* User info strip */}
          <div className="px-3 py-3 bg-black/20 flex items-center gap-2">
            <Avatar
              src={harmonicUser?.photoURL}
              name={harmonicUser?.preferredName || harmonicUser?.displayName || ''}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">
                {harmonicUser?.preferredName || harmonicUser?.displayName}
              </p>
              <p className="text-white/40 text-[10px] truncate">{harmonicUser?.voicePart}</p>
            </div>
            <button
              onClick={() => navigate('/settings')}
              aria-label="Settings"
              className="text-white/40 hover:text-white transition-colors"
            >
              <Settings size={14} aria-hidden="true" />
            </button>
          </div>
        </aside>

        {/* Mobile channel picker (shown when no channel selected) */}
        {!channelId && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 md:hidden p-6">
            <MessageSquare size={40} className="text-harmonic-muted" />
            <p className="text-harmonic-muted text-sm text-center">Select a channel below to start messaging</p>
            <div className="w-full flex flex-col gap-2">
              {visible.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => navigate(`/messages/${ch.id}`)}
                  className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-harmonic-border text-sm text-harmonic-text font-medium hover:border-harmonic-primary/40"
                >
                  <Hash size={16} className="text-harmonic-muted" />
                  {ch.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Channel content area */}
        {channelId && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <Outlet context={{ channels, visibleChannels: visible }} />
          </div>
        )}
      </div>

      {showNewModal && (
        <NewChannelModal
          onClose={() => setShowNewModal(false)}
          onCreate={handleCreateChannel}
        />
      )}
    </AppLayout>
  )
}
