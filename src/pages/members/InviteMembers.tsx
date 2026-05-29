import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { Copy, Check, MessageCircle, RefreshCw, QrCode } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { db } from '@/lib/firebase'
import { useChoir } from '@/contexts/ChoirContext'
import { generateInviteCode, formatShortDate } from '@/lib/utils'

export function InviteMembers() {
  const { choir, refreshChoir } = useChoir()
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  if (!choir) return null

  const inviteLink = `${window.location.origin}/join/${choir.inviteCode}`
  const expired = choir.inviteExpiry < new Date()

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Join our choir on Harmoniq! Tap to join ${choir.name}:\n${inviteLink}`,
    )
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener')
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const newCode = generateInviteCode()
      const newExpiry = new Date()
      newExpiry.setDate(newExpiry.getDate() + 7)
      await updateDoc(doc(db, 'choirs', choir.id), {
        inviteCode: newCode,
        inviteExpiry: newExpiry,
        updatedAt: serverTimestamp(),
      })
      await refreshChoir()
    } catch (err) {
      console.error('Regenerate invite error:', err)
    } finally {
      setRegenerating(false)
    }
  }

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-md mx-auto md:px-8">
        <PageHeader title="Invite members" subtitle="Bring your team in" back="/members" />

        <Card className="p-6">
          <p className="text-sm text-harmonic-muted mb-4">
            Share this link with your choir. Anyone who signs in with it joins {choir.name}.
          </p>

          {/* Invite code display */}
          <div className="bg-harmonic-surface rounded-2xl p-4 mb-4 text-center">
            <p className="text-xs text-harmonic-muted uppercase tracking-widest font-semibold">Invite code</p>
            <p className="text-3xl font-bold text-harmonic-primary tracking-[0.2em] mt-1 font-mono">
              {choir.inviteCode}
            </p>
          </div>

          {/* Link + copy */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 bg-harmonic-surface rounded-pill px-4 py-2.5 text-xs text-harmonic-muted truncate flex items-center min-h-[44px]">
              {inviteLink}
            </div>
            <Button variant="primary" size="sm" onClick={handleCopy} aria-label="Copy invite link">
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </Button>
          </div>

          {/* Share actions */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button variant="secondary" size="sm" onClick={handleWhatsApp} aria-label="Share via WhatsApp">
              <MessageCircle size={16} /> WhatsApp
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowQr(v => !v)} aria-label="Show QR code">
              <QrCode size={16} /> {showQr ? 'Hide QR' : 'QR code'}
            </Button>
          </div>

          {/* QR code */}
          {showQr && (
            <div className="flex justify-center py-4 mb-2 bg-white rounded-2xl border border-harmonic-border">
              <QRCodeSVG value={inviteLink} size={180} fgColor="#18005F" level="M" aria-label="Invite QR code" />
            </div>
          )}

          {/* Expiry + regenerate */}
          <div className="flex items-center justify-between pt-4 border-t border-harmonic-border">
            <p className="text-xs text-harmonic-muted">
              {expired ? (
                <span className="text-harmonic-danger font-medium">Expired</span>
              ) : (
                <>Expires {formatShortDate(choir.inviteExpiry)}</>
              )}
            </p>
            <button
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex items-center gap-1.5 text-xs font-medium text-harmonic-primary hover:opacity-80 disabled:opacity-50 min-h-[36px]"
            >
              <RefreshCw size={14} className={regenerating ? 'animate-spin' : ''} aria-hidden="true" />
              {regenerating ? 'Generating…' : 'Regenerate'}
            </button>
          </div>
        </Card>
      </div>
    </AppLayout>
  )
}
