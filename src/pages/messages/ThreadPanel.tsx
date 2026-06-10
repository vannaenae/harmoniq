import { useEffect, useRef, useState } from 'react'
import { X, MessageSquare } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { subscribeToThread, sendMessage, uploadAttachments } from '@/lib/messaging'
import { MessageBubble } from './MessageBubble'
import { Composer } from './Composer'
import { isSameGroup } from './chatUtils'
import type { Message } from '@/types'

interface ThreadPanelProps {
  root: Message
  channelId: string
  onClose: () => void
}

export function ThreadPanel({ root, channelId, onClose }: ThreadPanelProps) {
  const { harmonicUser } = useAuth()
  const { choir, isDirector } = useChoir()

  const [replies, setReplies] = useState<Message[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevCount = useRef(0)

  useEffect(() => {
    if (!choir) return
    return subscribeToThread(choir.id, channelId, root.id, setReplies)
  }, [choir, channelId, root.id])

  useEffect(() => {
    if (replies.length > prevCount.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevCount.current = replies.length
  }, [replies])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSend = async (text: string) => {
    if (!choir || !harmonicUser || sending) return
    setSending(true)
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
        parentId: root.id,
      })
      setFiles([])
    } catch (err) {
      console.error('Thread reply error:', err)
    } finally {
      setSending(false)
    }
  }

  return (
    <section
      className="fixed inset-0 z-40 bg-harmonic-background flex flex-col
                 md:static md:inset-auto md:z-auto md:w-[380px] md:flex-shrink-0 md:border-l md:border-black/[0.07]
                 animate-slide-in-right"
      aria-label="Thread"
    >
      {/* Thread header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-white/80 backdrop-blur-2xl border-b border-black/[0.07] flex-shrink-0">
        <MessageSquare size={16} className="text-harmonic-primary flex-shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-harmonic-text text-sm leading-tight">Thread</h2>
          <p className="text-[11px] text-harmonic-muted truncate">
            {root.threadCount} {root.threadCount === 1 ? 'reply' : 'replies'}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close thread"
          className="p-1.5 rounded-full text-harmonic-muted hover:bg-harmonic-surface hover:text-harmonic-text transition-colors duration-150"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      {/* Root message + replies */}
      <div className="flex-1 overflow-y-auto py-3">
        <MessageBubble
          msg={root}
          isMine={root.authorId === harmonicUser?.uid}
          isDirector={isDirector}
          choirId={choir?.id ?? ''}
          channelId={channelId}
          currentUserId={harmonicUser?.uid ?? ''}
          groupStart
          groupEnd
          inThread
        />

        {replies.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1 h-px bg-black/[0.07]" />
            <span className="text-[11px] text-harmonic-muted font-medium">
              {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </span>
            <div className="flex-1 h-px bg-black/[0.07]" />
          </div>
        )}

        {replies.map((msg, i) => {
          const sameGroup = isSameGroup(replies[i - 1], msg)
          const next = replies[i + 1]
          const nextSame = next ? isSameGroup(msg, next) : false
          return (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isMine={msg.authorId === harmonicUser?.uid}
              isDirector={isDirector}
              choirId={choir?.id ?? ''}
              channelId={channelId}
              currentUserId={harmonicUser?.uid ?? ''}
              groupStart={!sameGroup}
              groupEnd={!nextSame}
              inThread
            />
          )
        })}
        <div ref={bottomRef} />
      </div>

      <Composer
        placeholder="Reply in thread…"
        sending={sending}
        files={files}
        onFilesChange={setFiles}
        onSend={handleSend}
        autoFocus
      />
    </section>
  )
}
