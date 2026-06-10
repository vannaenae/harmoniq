import { useState } from 'react'
import { MessageSquare, Pin, Smile, Reply, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@harmoniq/shared'
import {
  deleteMessage,
  editMessage,
  pinMessage,
  toggleReaction,
} from '@harmoniq/shared'
import { AttachmentGallery } from './AttachmentView'
import { formatMsgTime, formatRelative } from './chatUtils'
import type { Message, ReplyPreview } from '@harmoniq/shared'

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🙏', '🔥', '🎵']

export function toReplyPreview(msg: Message): ReplyPreview {
  return {
    messageId: msg.id,
    authorName: msg.authorName,
    text: msg.text.slice(0, 120),
    hasAttachment: msg.attachments.length > 0,
  }
}

interface QuoteBlockProps {
  replyTo: ReplyPreview
  isMine: boolean
  onJump?: (messageId: string) => void
}

function QuoteBlock({ replyTo, isMine, onJump }: QuoteBlockProps) {
  return (
    <button
      onClick={() => onJump?.(replyTo.messageId)}
      className={cn(
        'block w-full text-left rounded-lg px-2.5 py-1.5 mb-1 border-l-2 transition-opacity duration-150 hover:opacity-80',
        isMine
          ? 'bg-white/15 border-white/70'
          : 'bg-black/[0.05] border-harmonic-primary',
      )}
      aria-label={`Jump to message from ${replyTo.authorName}`}
    >
      <span className={cn('block text-[11px] font-semibold', isMine ? 'text-white/90' : 'text-harmonic-primary')}>
        {replyTo.authorName}
      </span>
      <span className={cn('block text-xs truncate', isMine ? 'text-white/75' : 'text-harmonic-muted')}>
        {replyTo.text || (replyTo.hasAttachment ? '📎 Attachment' : '')}
      </span>
    </button>
  )
}

export interface MessageBubbleProps {
  msg: Message
  isMine: boolean
  isDirector: boolean
  choirId: string
  channelId: string
  currentUserId: string
  /** First message of an author group — show avatar and name */
  groupStart: boolean
  /** Last message of an author group — show timestamp */
  groupEnd: boolean
  /** Rendering inside the thread panel (no thread/pin actions there) */
  inThread?: boolean
  highlight?: boolean
  onReply?: (preview: ReplyPreview) => void
  onOpenThread?: (msg: Message) => void
  onJump?: (messageId: string) => void
}

export function MessageBubble({
  msg, isMine, isDirector, choirId, channelId, currentUserId,
  groupStart, groupEnd, inThread, highlight, onReply, onOpenThread, onJump,
}: MessageBubbleProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [actionsOpen, setActionsOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(msg.text)

  const canDelete = isMine || isDirector
  const canPin = isDirector && !inThread

  const handleEdit = async () => {
    if (!editText.trim() || editText === msg.text) { setEditing(false); return }
    await editMessage(choirId, channelId, msg.id, editText.trim())
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm(msg.threadCount > 0 ? 'Delete this message and its thread?' : 'Delete this message?')) return
    await deleteMessage(choirId, channelId, msg)
    setMenuOpen(false)
  }

  const handlePin = async () => {
    await pinMessage(choirId, channelId, msg.id, !msg.pinned)
    setMenuOpen(false)
  }

  const handleReact = async (emoji: string) => {
    setEmojiOpen(false)
    await toggleReaction(choirId, channelId, msg.id, emoji, currentUserId)
  }

  const hasReactions = Object.values(msg.reactions).some(users => users.length > 0)
  const showActions = !editing

  return (
    <div
      id={`msg-${msg.id}`}
      className={cn(
        'group relative flex gap-2.5 px-4 transition-colors duration-500 animate-bubble-in',
        groupStart ? 'mt-3' : 'mt-0.5',
        isMine ? 'flex-row-reverse' : '',
        highlight && 'bg-harmonic-primary/10 rounded-xl',
      )}
    >
      {/* Avatar column — only for others, only on group start */}
      {!isMine && (
        <div className="w-8 flex-shrink-0">
          {groupStart && <Avatar src={msg.authorPhotoUrl} name={msg.authorName} size="sm" className="mt-0.5" />}
        </div>
      )}

      <div className={cn('flex flex-col max-w-[75%] md:max-w-[65%] min-w-0', isMine ? 'items-end' : 'items-start')}>
        {!isMine && groupStart && (
          <span className="text-xs font-semibold text-harmonic-text/80 mb-1 px-1">{msg.authorName}</span>
        )}

        {/* Pinned marker */}
        {msg.pinned && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-harmonic-warning mb-0.5 px-1">
            <Pin size={10} aria-hidden="true" /> Pinned
          </span>
        )}

        {/* Image / file attachments — edge-to-edge, no bubble chrome */}
        {msg.attachments.length > 0 && (
          <div
            className={cn('flex flex-col gap-1.5', msg.text ? 'mb-1' : '')}
            onClick={() => setActionsOpen(v => !v)}
          >
            {msg.replyTo && !msg.text && (
              <QuoteBlock replyTo={msg.replyTo} isMine={isMine} onJump={onJump} />
            )}
            <AttachmentGallery attachments={msg.attachments} isMine={isMine} />
          </div>
        )}

        {/* Text bubble */}
        {editing ? (
          <div className="flex gap-2 items-center animate-fade-in">
            <input
              autoFocus
              value={editText}
              onChange={e => setEditText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleEdit(); if (e.key === 'Escape') setEditing(false) }}
              className="px-3 py-2 rounded-xl border border-harmonic-primary/40 ring-4 ring-harmonic-primary/10 text-sm outline-none bg-white min-w-[200px]"
            />
            <button onClick={handleEdit} className="text-harmonic-primary text-xs font-semibold">Save</button>
            <button onClick={() => setEditing(false)} className="text-harmonic-muted text-xs">Cancel</button>
          </div>
        ) : msg.text ? (
          <div
            onClick={() => setActionsOpen(v => !v)}
            className={cn(
              'px-3.5 py-2 text-[15px] leading-snug break-words whitespace-pre-wrap rounded-[18px] cursor-default',
              isMine
                ? 'bg-harmonic-primary text-white'
                : 'bg-[#E9E9EB] text-harmonic-text',
              // iMessage-style tightened corner at the tail of the group
              isMine && groupEnd && 'rounded-br-md',
              !isMine && groupEnd && 'rounded-bl-md',
            )}
          >
            {msg.replyTo && <QuoteBlock replyTo={msg.replyTo} isMine={isMine} onJump={onJump} />}
            {msg.text}
            {msg.editedAt && (
              <span className={cn('text-[10px] ml-1.5', isMine ? 'text-white/60' : 'text-harmonic-muted')}>
                (edited)
              </span>
            )}
          </div>
        ) : null}

        {/* Reactions */}
        {hasReactions && (
          <div className={cn('flex flex-wrap gap-1 mt-1', isMine ? 'justify-end' : '')}>
            {Object.entries(msg.reactions).map(([emoji, users]) =>
              users.length > 0 ? (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className={cn(
                    'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all duration-150 active:scale-90 animate-scale-in',
                    users.includes(currentUserId)
                      ? 'bg-harmonic-primary/10 border-harmonic-primary/30 text-harmonic-primary font-medium'
                      : 'bg-white border-black/[0.08] text-harmonic-text hover:border-harmonic-primary/40',
                  )}
                  aria-label={`${emoji} ${users.length} reaction${users.length > 1 ? 's' : ''}`}
                >
                  {emoji} {users.length}
                </button>
              ) : null,
            )}
          </div>
        )}

        {/* Thread pill */}
        {!inThread && msg.threadCount > 0 && (
          <button
            onClick={() => onOpenThread?.(msg)}
            className="flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-full text-xs font-semibold text-harmonic-primary bg-harmonic-primary/10 hover:bg-harmonic-primary/15 transition-all duration-150 active:scale-95"
          >
            <MessageSquare size={12} aria-hidden="true" />
            {msg.threadCount} {msg.threadCount === 1 ? 'reply' : 'replies'}
            {msg.threadLastReplyAt && (
              <span className="font-normal text-harmonic-primary/70">· {formatRelative(msg.threadLastReplyAt)}</span>
            )}
          </button>
        )}

        {/* Timestamp at the end of a group */}
        {groupEnd && (
          <span className="text-[10px] text-harmonic-muted mt-1 px-1">{formatMsgTime(msg.createdAt)}</span>
        )}
      </div>

      {/* Floating action bar — hover on desktop, tap-to-toggle on touch */}
      {showActions && (
        <div
          className={cn(
            'flex items-center gap-0.5 self-start mt-0.5 transition-opacity duration-150',
            'bg-white border border-black/[0.06] rounded-full shadow-card px-1 py-0.5',
            actionsOpen || emojiOpen || menuOpen
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto',
            (actionsOpen || emojiOpen || menuOpen) && 'pointer-events-auto',
          )}
        >
          <div className="relative">
            <button
              onClick={() => { setEmojiOpen(p => !p); setMenuOpen(false) }}
              className="p-1.5 rounded-full hover:bg-harmonic-surface text-harmonic-muted hover:text-harmonic-text transition-colors duration-150"
              aria-label="Add reaction"
            >
              <Smile size={15} aria-hidden="true" />
            </button>
            {emojiOpen && (
              <div className={cn(
                'absolute z-20 bg-white rounded-full shadow-pop border border-black/[0.06] p-1 flex gap-0.5 bottom-full mb-1.5 animate-scale-in',
                isMine ? 'right-0' : 'left-0',
              )}>
                {QUICK_REACTIONS.map(e => (
                  <button
                    key={e}
                    onClick={() => handleReact(e)}
                    className="p-1.5 rounded-full hover:bg-harmonic-surface text-lg transition-transform duration-150 hover:scale-125"
                    aria-label={`React with ${e}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          {onReply && (
            <button
              onClick={() => onReply(toReplyPreview(msg))}
              className="p-1.5 rounded-full hover:bg-harmonic-surface text-harmonic-muted hover:text-harmonic-text transition-colors duration-150"
              aria-label="Reply"
            >
              <Reply size={15} aria-hidden="true" />
            </button>
          )}

          {!inThread && onOpenThread && (
            <button
              onClick={() => onOpenThread(msg)}
              className="p-1.5 rounded-full hover:bg-harmonic-surface text-harmonic-muted hover:text-harmonic-text transition-colors duration-150"
              aria-label="Reply in thread"
            >
              <MessageSquare size={15} aria-hidden="true" />
            </button>
          )}

          {(canDelete || canPin || isMine) && (
            <div className="relative">
              <button
                onClick={() => { setMenuOpen(p => !p); setEmojiOpen(false) }}
                className="p-1.5 rounded-full hover:bg-harmonic-surface text-harmonic-muted hover:text-harmonic-text transition-colors duration-150"
                aria-label="Message options"
              >
                <MoreHorizontal size={15} aria-hidden="true" />
              </button>
              {menuOpen && (
                <div className={cn(
                  'absolute z-20 bg-white rounded-xl shadow-pop border border-black/[0.06] py-1 w-40 bottom-full mb-1.5 animate-scale-in overflow-hidden',
                  isMine ? 'right-0' : 'left-0',
                )}>
                  {isMine && msg.text && (
                    <button
                      onClick={() => { setEditing(true); setMenuOpen(false) }}
                      className="w-full px-3 py-2 text-sm text-harmonic-text hover:bg-harmonic-surface text-left flex items-center gap-2 transition-colors duration-150"
                    >
                      <Pencil size={14} aria-hidden="true" /> Edit
                    </button>
                  )}
                  {canPin && (
                    <button
                      onClick={handlePin}
                      className="w-full px-3 py-2 text-sm text-harmonic-text hover:bg-harmonic-surface text-left flex items-center gap-2 transition-colors duration-150"
                    >
                      <Pin size={14} aria-hidden="true" />
                      {msg.pinned ? 'Unpin' : 'Pin'}
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-2 text-sm text-harmonic-danger hover:bg-harmonic-danger/5 text-left flex items-center gap-2 transition-colors duration-150"
                    >
                      <Trash2 size={14} aria-hidden="true" /> Delete
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
