import { useEffect, useState } from 'react'
import { useNavigate, useParams, Outlet } from 'react-router-dom'
import { Hash, Plus, Settings, ChevronDown, ChevronRight, MessageSquare, Lock } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@harmoniq/shared'
import { useAuth } from '@harmoniq/shared'
import { useChoir } from '@harmoniq/shared'
import { subscribeToChannels, seedDefaultChannels, createChannel } from '@harmoniq/shared'
import { NewChannelModal } from './NewChannelModal'
import { formatListTime } from './chatUtils'
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

  // Auto-navigate to first visible channel (desktop only — mobile shows the list)
  useEffect(() => {
    if (!channelId && channels.length > 0 && window.matchMedia('(min-width: 768px)').matches) {
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

        {/* Sidebar — channel list (desktop) */}
        <aside className="w-72 flex-shrink-0 bg-white/70 backdrop-blur-2xl border-r border-black/[0.07] flex-col overflow-y-auto hidden md:flex">
          {/* Header */}
          <div className="px-5 py-4 border-b border-black/[0.07]">
            <p className="font-bold text-harmonic-text text-base tracking-tight truncate">
              {choir?.name ?? 'Messages'}
            </p>
            {choir?.churchName && (
              <p className="text-harmonic-muted text-xs mt-0.5 truncate">{choir.churchName}</p>
            )}
          </div>

          {/* Channel groups */}
          <nav className="flex-1 px-2.5 py-3" aria-label="Channels">
            {Object.entries(grouped).map(([category, chs]) => (
              <div key={category} className="mb-4">
                <button
                  className="w-full flex items-center gap-1 px-2 py-1 text-harmonic-muted text-[11px] font-semibold uppercase tracking-wider hover:text-harmonic-text transition-colors duration-150"
                  onClick={() => setCollapsed(p => ({ ...p, [category]: !p[category] }))}
                  aria-expanded={!collapsed[category]}
                >
                  <span className={cn('transition-transform duration-200', collapsed[category] ? '' : 'rotate-0')}>
                    {collapsed[category]
                      ? <ChevronRight size={12} aria-hidden="true" />
                      : <ChevronDown size={12} aria-hidden="true" />
                    }
                  </span>
                  {CATEGORY_LABELS[category] ?? category}
                </button>

                {!collapsed[category] && (
                  <div className="animate-fade-in">
                    {chs.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => navigate(`/messages/${ch.id}`)}
                        className={cn(
                          'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors duration-150 text-left',
                          channelId === ch.id
                            ? 'bg-harmonic-primary/10'
                            : 'hover:bg-black/[0.04]',
                        )}
                      >
                        <span
                          className={cn(
                            'flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0',
                            channelId === ch.id ? 'bg-harmonic-primary/15' : 'bg-harmonic-surface',
                          )}
                        >
                          {ch.directorOnly
                            ? <Lock size={13} className={channelId === ch.id ? 'text-harmonic-primary' : 'text-harmonic-muted'} aria-hidden="true" />
                            : <Hash size={13} className={channelId === ch.id ? 'text-harmonic-primary' : 'text-harmonic-muted'} aria-hidden="true" />
                          }
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="flex items-center justify-between gap-2">
                            <span className={cn(
                              'text-sm truncate',
                              channelId === ch.id ? 'text-harmonic-primary font-semibold' : 'text-harmonic-text font-medium',
                            )}>
                              {ch.name}
                            </span>
                            {ch.lastMessageAt && (
                              <span className="text-[10px] text-harmonic-muted flex-shrink-0">
                                {formatListTime(ch.lastMessageAt)}
                              </span>
                            )}
                          </span>
                          {ch.lastMessagePreview && (
                            <span className="block text-xs text-harmonic-muted truncate">
                              {ch.lastMessagePreview}
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Add channel — directors only */}
          {isDirector && (
            <div className="px-4 py-3 border-t border-black/[0.07]">
              <button
                onClick={() => setShowNewModal(true)}
                className="flex items-center gap-2 text-harmonic-muted hover:text-harmonic-primary text-xs font-medium transition-colors duration-150"
              >
                <Plus size={14} aria-hidden="true" />
                Add channel
              </button>
            </div>
          )}

          {/* User info strip */}
          <div className="px-4 py-3 border-t border-black/[0.07] flex items-center gap-2.5">
            <Avatar
              src={harmonicUser?.photoURL}
              name={harmonicUser?.preferredName || harmonicUser?.displayName || ''}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-harmonic-text text-xs font-semibold truncate">
                {harmonicUser?.preferredName || harmonicUser?.displayName}
              </p>
              <p className="text-harmonic-muted text-[10px] truncate capitalize">{harmonicUser?.voicePart}</p>
            </div>
            <button
              onClick={() => navigate('/settings')}
              aria-label="Settings"
              className="text-harmonic-muted hover:text-harmonic-text transition-colors duration-150"
            >
              <Settings size={15} aria-hidden="true" />
            </button>
          </div>
        </aside>

        {/* Mobile channel list — WhatsApp-style rows */}
        {!channelId && (
          <div className="flex-1 flex flex-col md:hidden overflow-y-auto">
            <div className="px-5 pt-6 pb-3">
              <h1 className="text-2xl font-bold text-harmonic-text tracking-tight">Messages</h1>
              {choir?.name && <p className="text-sm text-harmonic-muted mt-0.5">{choir.name}</p>}
            </div>
            <div className="flex-1 px-3 pb-6">
              {visible.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 py-20 text-harmonic-muted animate-fade-in">
                  <MessageSquare size={36} aria-hidden="true" />
                  <p className="text-sm">No channels yet</p>
                </div>
              )}
              <div className="flex flex-col gap-1">
                {visible.map((ch, i) => (
                  <button
                    key={ch.id}
                    onClick={() => navigate(`/messages/${ch.id}`)}
                    className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white border border-black/[0.04] shadow-card text-left active:scale-[0.98] transition-transform duration-150 animate-slide-up"
                    style={{ animationDelay: `${Math.min(i * 40, 240)}ms` }}
                  >
                    <span className="flex items-center justify-center w-11 h-11 rounded-full bg-harmonic-primary/10 flex-shrink-0">
                      {ch.directorOnly
                        ? <Lock size={17} className="text-harmonic-primary" aria-hidden="true" />
                        : <Hash size={17} className="text-harmonic-primary" aria-hidden="true" />
                      }
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[15px] font-semibold text-harmonic-text truncate">{ch.name}</span>
                        {ch.lastMessageAt && (
                          <span className="text-[11px] text-harmonic-muted flex-shrink-0">
                            {formatListTime(ch.lastMessageAt)}
                          </span>
                        )}
                      </span>
                      <span className="block text-[13px] text-harmonic-muted truncate mt-0.5">
                        {ch.lastMessagePreview ?? ch.description ?? 'No messages yet'}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
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
