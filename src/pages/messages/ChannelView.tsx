import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import { ArrowLeft, Hash, Pin, Lock, UploadCloud, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import {
  subscribeToMessages,
  subscribeToTyping,
  sendMessage,
  uploadAttachments,
  pinMessage,
  setTyping,
  clearTyping,
  TYPING_TTL_MS,
} from '@/lib/messaging'
import { MessageBubble } from './MessageBubble'
import { Composer } from './Composer'
import { ThreadPanel } from './ThreadPanel'
import { groupByDay, isSameGroup } from './chatUtils'
import type { Channel, Message, ReplyPreview, TypingUser } from '@/types'

const NEAR_BOTTOM_PX = 150
const TYPING_THROTTLE_MS = 2500

function TypingIndicator({ users }: { users: TypingUser[] }) {
  if (users.length === 0) return null
  const label =
    users.length === 1
      ? `${users[0].name} is typing`
      : users.length === 2
        ? `${users[0].name} and ${users[1].name} are typing`
        : 'Several people are typing'
  return (
    <div className="flex items-center gap-2 px-6 pb-1 text-xs text-harmonic-muted animate-fade-in" role="status">
      <span className="flex gap-0.5">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-harmonic-muted animate-typing-dot"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
      {label}…
    </div>
  )
}

export function ChannelView() {
  const { channelId } = useParams<{ channelId: string }>()
  const navigate = useNavigate()
  const { harmonicUser } = useAuth()
  const { choir, isDirector } = useChoir()
  const { channels } = useOutletContext<{ channels: Channel[] }>()

  const channel = channels.find(c => c.id === channelId)
  const channelName = channel?.name ?? ''
  const readOnly = Boolean(channel?.directorOnly) && !isDirector

  const [messages, setMessages] = useState<Message[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [replyTo, setReplyTo] = useState<ReplyPreview | null>(null)
  const [threadRootId, setThreadRootId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [pinnedOpen, setPinnedOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [highlightId, setHighlightId] = useState<string | null>(null)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const [typingTick, setTypingTick] = useState(0)

  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const nearBottom = useRef(true)
  const prevCount = useRef(0)
  const lastTypingWrite = useRef(0)
  const dragDepth = useRef(0)

  const threadRoot = useMemo(
    () => messages.find(m => m.id === threadRootId) ?? null,
    [messages, threadRootId],
  )
  const pinned = useMemo(() => messages.filter(m => m.pinned), [messages])

  // Reset per-channel state when switching channels
  useEffect(() => {
    setReplyTo(null)
    setThreadRootId(null)
    setFiles([])
    setPinnedOpen(false)
    prevCount.current = 0
    nearBottom.current = true
  }, [channelId])

  useEffect(() => {
    if (!choir || !channelId) return
    return subscribeToMessages(choir.id, channelId, setMessages)
  }, [choir, channelId])

  // Typing presence: subscribe + tick every 2s so stale entries expire
  useEffect(() => {
    if (!choir || !channelId) return
    const unsub = subscribeToTyping(choir.id, channelId, setTypingUsers)
    const tick = setInterval(() => setTypingTick(t => t + 1), 2000)
    return () => { unsub(); clearInterval(tick) }
  }, [choir, channelId])

  const activeTypers = useMemo(() => {
    void typingTick // re-evaluate on tick
    const cutoff = Date.now() - TYPING_TTL_MS
    return typingUsers.filter(u => u.at > cutoff && u.uid !== harmonicUser?.uid)
  }, [typingUsers, typingTick, harmonicUser?.uid])

  // Smart autoscroll: jump only when already near the bottom (or own send)
  useEffect(() => {
    if (messages.length > prevCount.current && nearBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: prevCount.current === 0 ? 'auto' : 'smooth' })
    }
    prevCount.current = messages.length
  }, [messages])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX
  }

  const jumpToMessage = useCallback((id: string) => {
    document.getElementById(`msg-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setHighlightId(id)
    setTimeout(() => setHighlightId(null), 1600)
  }, [])

  const handleTyping = useCallback(() => {
    if (!choir || !channelId || !harmonicUser) return
    const now = Date.now()
    if (now - lastTypingWrite.current < TYPING_THROTTLE_MS) return
    lastTypingWrite.current = now
    setTyping(choir.id, channelId, harmonicUser.uid, harmonicUser.preferredName || harmonicUser.displayName)
  }, [choir, channelId, harmonicUser])

  const handleSend = async (text: string) => {
    if (!choir || !channelId || !harmonicUser || sending) return
    setSending(true)
    nearBottom.current = true
    try {
      const attachments = files.length > 0
        ? await uploadAttachments(choir.id, channelId, files)
        : []
      await sendMessage(choir.id, channelId, {
        text,
        authorId: harmonicUser.uid,
        authorName: harmonicUser.preferredName || harmonicUser.displayName,
        authorPhotoUrl: harmonicUser.photoURL,
        attachments,
        replyTo,
      })
      setFiles([])
      setReplyTo(null)
      lastTypingWrite.current = 0
      clearTyping(choir.id, channelId, harmonicUser.uid)
    } catch (err) {
      console.error('Send message error:', err)
    } finally {
      setSending(false)
    }
  }

  // Drag & drop attachments
  const onDragEnter = (e: React.DragEvent) => {
    if (readOnly || !e.dataTransfer.types.includes('Files')) return
    e.preventDefault()
    dragDepth.current += 1
    setDragging(true)
  }
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) setDragging(false)
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    if (readOnly) return
    const dropped = Array.from(e.dataTransfer.files)
    if (dropped.length > 0) setFiles(prev => [...prev, ...dropped].slice(0, 10))
  }

  const grouped = groupByDay(messages)

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <div
        className="flex flex-col flex-1 min-w-0 relative"
        onDragEnter={onDragEnter}
        onDragOver={e => e.preventDefault()}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* Channel header — frosted */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-2xl border-b border-black/[0.07] flex-shrink-0 z-10">
          <button
            className="md:hidden p-1 -ml-1 text-harmonic-muted hover:text-harmonic-text transition-colors duration-150"
            onClick={() => navigate('/messages')}
            aria-label="Back to channels"
          >
            <ArrowLeft size={19} aria-hidden="true" />
          </button>
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-harmonic-primary/10 flex-shrink-0">
            <Hash size={15} className="text-harmonic-primary" aria-hidden="true" />
          </span>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-harmonic-text text-sm leading-tight truncate">{channelName}</h1>
            {channel?.description && (
              <p className="text-[11px] text-harmonic-muted truncate">{channel.description}</p>
            )}
          </div>
          {pinned.length > 0 && (
            <button
              onClick={() => setPinnedOpen(v => !v)}
              aria-expanded={pinnedOpen}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 active:scale-95',
                pinnedOpen
                  ? 'bg-harmonic-warning/15 text-[#C93400]'
                  : 'text-harmonic-muted hover:bg-harmonic-surface hover:text-harmonic-text',
              )}
            >
              <Pin size={13} aria-hidden="true" />
              {pinned.length}
            </button>
          )}
        </div>

        {/* Pinned messages dropdown */}
        {pinnedOpen && (
          <div className="absolute top-14 right-3 left-3 md:left-auto md:w-96 z-20 bg-white/95 backdrop-blur-2xl border border-black/[0.06] rounded-card shadow-pop p-2 animate-scale-in origin-top-right max-h-72 overflow-y-auto">
            <div className="flex items-center justify-between px-2 py-1.5">
              <span className="text-xs font-semibold text-harmonic-text">Pinned messages</span>
              <button
                onClick={() => setPinnedOpen(false)}
                aria-label="Close pinned messages"
                className="p-1 rounded-full text-harmonic-muted hover:bg-harmonic-surface transition-colors duration-150"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
            {pinned.map(p => (
              <div key={p.id} className="flex items-start gap-2 px-2 py-2 rounded-lg hover:bg-harmonic-surface transition-colors duration-150 group/pin">
                <button
                  className="flex-1 min-w-0 text-left"
                  onClick={() => { jumpToMessage(p.id); setPinnedOpen(false) }}
                >
                  <span className="block text-xs font-semibold text-harmonic-text">{p.authorName}</span>
                  <span className="block text-xs text-harmonic-muted truncate">
                    {p.text || (p.attachments.length > 0 ? '📎 Attachment' : '')}
                  </span>
                </button>
                {isDirector && choir && channelId && (
                  <button
                    onClick={() => pinMessage(choir.id, channelId, p.id, false)}
                    aria-label="Unpin"
                    className="opacity-0 group-hover/pin:opacity-100 p-1 rounded-full text-harmonic-muted hover:text-harmonic-danger transition-all duration-150"
                  >
                    <X size={13} aria-hidden="true" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto py-3">
          {grouped.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-harmonic-muted animate-fade-in">
              <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-harmonic-primary/10">
                <Hash size={26} className="text-harmonic-primary" aria-hidden="true" />
              </span>
              <p className="text-sm font-medium text-harmonic-text">Welcome to #{channelName}</p>
              <p className="text-xs">Start the conversation — say hello 👋</p>
            </div>
          )}

          {grouped.map(({ day, messages: dayMsgs }) => (
            <div key={day}>
              <div className="flex justify-center py-3">
                <span className="px-3 py-1 rounded-full bg-black/[0.05] text-[11px] text-harmonic-muted font-medium">
                  {day}
                </span>
              </div>
              {dayMsgs.map((msg, i) => {
                const sameGroup = isSameGroup(dayMsgs[i - 1], msg)
                const next = dayMsgs[i + 1]
                const nextSame = next ? isSameGroup(msg, next) : false
                return (
                  <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isMine={msg.authorId === harmonicUser?.uid}
                    isDirector={isDirector}
                    choirId={choir?.id ?? ''}
                    channelId={channelId ?? ''}
                    currentUserId={harmonicUser?.uid ?? ''}
                    groupStart={!sameGroup}
                    groupEnd={!nextSame}
                    highlight={highlightId === msg.id}
                    onReply={readOnly ? undefined : setReplyTo}
                    onOpenThread={m => setThreadRootId(m.id)}
                    onJump={jumpToMessage}
                  />
                )
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <TypingIndicator users={activeTypers} />

        {/* Composer or read-only notice */}
        {readOnly ? (
          <div className="flex items-center justify-center gap-2 px-4 py-4 mx-4 mb-4 rounded-2xl bg-harmonic-surface text-harmonic-muted text-sm flex-shrink-0">
            <Lock size={14} aria-hidden="true" />
            Only directors can post in #{channelName}
          </div>
        ) : (
          <Composer
            placeholder={`Message #${channelName}`}
            sending={sending}
            files={files}
            onFilesChange={setFiles}
            replyTo={replyTo}
            onCancelReply={() => setReplyTo(null)}
            onSend={handleSend}
            onTyping={handleTyping}
          />
        )}

        {/* Drag overlay */}
        {dragging && (
          <div className="absolute inset-2 z-30 rounded-card-lg border-2 border-dashed border-harmonic-primary bg-harmonic-primary/5 backdrop-blur-sm flex flex-col items-center justify-center gap-2 pointer-events-none animate-fade-in">
            <UploadCloud size={32} className="text-harmonic-primary" aria-hidden="true" />
            <p className="text-sm font-semibold text-harmonic-primary">Drop files to attach</p>
          </div>
        )}
      </div>

      {/* Thread side panel */}
      {threadRoot && channelId && (
        <ThreadPanel
          root={threadRoot}
          channelId={channelId}
          onClose={() => setThreadRootId(null)}
        />
      )}
    </div>
  )
}
