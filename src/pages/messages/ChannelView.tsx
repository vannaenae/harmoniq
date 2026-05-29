import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Hash, Pin, Send, MoreVertical, Smile, Trash2 } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import {
  subscribeToMessages,
  sendMessage,
  deleteMessage,
  pinMessage,
  toggleReaction,
  editMessage,
} from '@/lib/messaging'
import type { Message } from '@/types'

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🙏', '🔥', '🎵']

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function formatDay(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

interface MessageBubbleProps {
  msg: Message
  isMine: boolean
  isDirector: boolean
  choirId: string
  channelId: string
  currentUserId: string
}

function MessageBubble({ msg, isMine, isDirector, choirId, channelId, currentUserId }: MessageBubbleProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(msg.text)

  const handleEdit = async () => {
    if (!editText.trim() || editText === msg.text) { setEditing(false); return }
    await editMessage(choirId, channelId, msg.id, editText.trim())
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this message?')) return
    await deleteMessage(choirId, channelId, msg.id)
    setMenuOpen(false)
  }

  const handlePin = async () => {
    await pinMessage(choirId, channelId, msg.id, !msg.pinned)
    setMenuOpen(false)
  }

  const handleReact = async (emoji: string) => {
    await toggleReaction(choirId, channelId, msg.id, emoji, currentUserId)
    setEmojiOpen(false)
  }

  const canDelete = isMine || isDirector
  const canPin = isDirector

  return (
    <div
      className={cn(
        'group flex gap-3 px-4 py-1 hover:bg-black/5 rounded-lg transition-colors',
        isMine ? 'flex-row-reverse' : '',
      )}
    >
      {!isMine && (
        <Avatar src={msg.authorPhotoUrl} name={msg.authorName} size="sm" className="flex-shrink-0 mt-1" />
      )}

      <div className={cn('flex flex-col max-w-[70%]', isMine ? 'items-end' : 'items-start')}>
        {!isMine && (
          <span className="text-xs font-semibold text-harmonic-text mb-1">{msg.authorName}</span>
        )}

        {editing ? (
          <div className="flex gap-2 items-center">
            <input
              autoFocus
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleEdit(); if (e.key === 'Escape') setEditing(false) }}
              className="px-3 py-2 rounded-xl border-2 border-harmonic-primary text-sm outline-none bg-white min-w-[180px]"
            />
            <button onClick={handleEdit} className="text-harmonic-primary text-xs font-semibold">Save</button>
            <button onClick={() => setEditing(false)} className="text-harmonic-muted text-xs">Cancel</button>
          </div>
        ) : (
          <div
            className={cn(
              'px-3 py-2 rounded-2xl text-sm break-words',
              isMine
                ? 'bg-harmonic-primary text-white rounded-tr-sm'
                : 'bg-white border border-harmonic-border text-harmonic-text rounded-tl-sm',
            )}
          >
            {msg.pinned && (
              <span className="flex items-center gap-1 text-[10px] font-semibold opacity-60 mb-1">
                <Pin size={10} aria-hidden="true" /> Pinned
              </span>
            )}
            {msg.text}
            {msg.editedAt && (
              <span className="text-[10px] opacity-50 ml-1">(edited)</span>
            )}
          </div>
        )}

        {/* Reactions */}
        {Object.entries(msg.reactions).some(([, users]) => users.length > 0) && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(msg.reactions).map(([emoji, users]) =>
              users.length > 0 ? (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-colors',
                    users.includes(currentUserId)
                      ? 'bg-harmonic-primary/10 border-harmonic-primary/30 text-harmonic-primary'
                      : 'bg-white border-harmonic-border text-harmonic-text hover:border-harmonic-primary/40',
                  )}
                >
                  {emoji} {users.length}
                </button>
              ) : null,
            )}
          </div>
        )}

        <span className="text-[10px] text-harmonic-muted mt-0.5">{formatTime(msg.createdAt)}</span>
      </div>

      {/* Action buttons — show on hover */}
      {!editing && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 self-start mt-1">
          <div className="relative">
            <button
              onClick={() => setEmojiOpen(p => !p)}
              className="p-1 rounded-full hover:bg-harmonic-surface text-harmonic-muted hover:text-harmonic-text"
              aria-label="Add reaction"
            >
              <Smile size={14} aria-hidden="true" />
            </button>
            {emojiOpen && (
              <div className="absolute z-20 bg-white rounded-xl shadow-card-hover border border-harmonic-border p-1.5 flex gap-1 bottom-full mb-1 left-0">
                {QUICK_REACTIONS.map(e => (
                  <button
                    key={e}
                    onClick={() => handleReact(e)}
                    className="p-1 rounded-lg hover:bg-harmonic-surface text-base"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          {(canDelete || canPin) && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(p => !p)}
                className="p-1 rounded-full hover:bg-harmonic-surface text-harmonic-muted hover:text-harmonic-text"
                aria-label="Message options"
              >
                <MoreVertical size={14} aria-hidden="true" />
              </button>
              {menuOpen && (
                <div className="absolute z-20 bg-white rounded-xl shadow-card-hover border border-harmonic-border py-1 w-36 right-0 bottom-full mb-1">
                  {isMine && (
                    <button
                      onClick={() => { setEditing(true); setMenuOpen(false) }}
                      className="w-full px-3 py-2 text-sm text-harmonic-text hover:bg-harmonic-surface text-left"
                    >
                      Edit
                    </button>
                  )}
                  {canPin && (
                    <button
                      onClick={handlePin}
                      className="w-full px-3 py-2 text-sm text-harmonic-text hover:bg-harmonic-surface text-left flex items-center gap-2"
                    >
                      <Pin size={14} aria-hidden="true" />
                      {msg.pinned ? 'Unpin' : 'Pin'}
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-2 text-sm text-harmonic-danger hover:bg-red-50 text-left flex items-center gap-2"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ChannelView() {
  const { channelId } = useParams<{ channelId: string }>()
  const navigate = useNavigate()
  const { harmonicUser } = useAuth()
  const { choir, isDirector } = useChoir()

  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!choir || !channelId) return
    const unsub = subscribeToMessages(choir.id, channelId, setMessages)
    return unsub
  }, [choir, channelId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || !choir || !channelId || !harmonicUser) return
    setSending(true)
    try {
      await sendMessage(choir.id, channelId, {
        text: text.trim(),
        authorId: harmonicUser.uid,
        authorName: harmonicUser.preferredName || harmonicUser.displayName,
        authorPhotoUrl: harmonicUser.photoURL,
      })
      setText('')
      inputRef.current?.focus()
    } catch (err) {
      console.error('Send message error:', err)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group messages by day
  const grouped: { day: string; messages: Message[] }[] = []
  let currentDay = ''
  for (const msg of messages) {
    const day = msg.createdAt.toDateString()
    if (day !== currentDay) {
      grouped.push({ day: formatDay(msg.createdAt), messages: [msg] })
      currentDay = day
    } else {
      grouped[grouped.length - 1].messages.push(msg)
    }
  }

  const channelName = channelId ?? ''

  return (
    <>
      {/* Channel header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-harmonic-border bg-white flex-shrink-0">
        <button
          className="md:hidden text-harmonic-muted hover:text-harmonic-text"
          onClick={() => navigate('/messages')}
          aria-label="Back to channels"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </button>
        <Hash size={16} className="text-harmonic-muted flex-shrink-0" aria-hidden="true" />
        <h1 className="font-semibold text-harmonic-text text-sm">{channelName}</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1 bg-harmonic-surface/30">
        {grouped.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-harmonic-muted">
            <Hash size={32} aria-hidden="true" />
            <p className="text-sm">Start the conversation in #{channelName}</p>
          </div>
        )}

        {grouped.map(({ day, messages: dayMsgs }) => (
          <div key={day}>
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="flex-1 h-px bg-harmonic-border" />
              <span className="text-xs text-harmonic-muted font-medium">{day}</span>
              <div className="flex-1 h-px bg-harmonic-border" />
            </div>
            {dayMsgs.map(msg => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isMine={msg.authorId === harmonicUser?.uid}
                isDirector={isDirector}
                choirId={choir?.id ?? ''}
                channelId={channelId ?? ''}
                currentUserId={harmonicUser?.uid ?? ''}
              />
            ))}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 bg-white border-t border-harmonic-border flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message #${channelName}`}
            rows={1}
            className="flex-1 resize-none rounded-2xl border-2 border-harmonic-border bg-harmonic-surface/50 px-4 py-2.5 text-sm text-harmonic-text placeholder:text-harmonic-muted focus:outline-none focus:border-harmonic-primary transition-colors max-h-32 overflow-y-auto"
            style={{ lineHeight: '1.5' }}
            aria-label={`Message input for #${channelName}`}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-harmonic-primary flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-harmonic-primary/90 transition-colors"
            aria-label="Send message"
          >
            <Send size={16} aria-hidden="true" />
          </button>
        </div>
        <p className="text-[10px] text-harmonic-muted mt-1.5">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </>
  )
}
