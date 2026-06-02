import { useState, useRef } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { Check, Upload, Archive, UserCog, FileCheck2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Toggle } from '@/components/ui/Toggle'
import { PageHeader } from '@/components/ui/PageHeader'
import { db, storage } from '@/lib/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { useChoir } from '@/contexts/ChoirContext'
import { updateMemberRole } from '@/lib/members'
import { voicePartLabel } from '@/lib/utils'

export function ChoirSettings() {
  const { firebaseUser } = useAuth()
  const { choir, members, refreshChoir, refreshMembers } = useChoir()
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(choir?.name ?? '')
  const [churchName, setChurchName] = useState(choir?.churchName ?? '')
  const [description, setDescription] = useState(choir?.description ?? '')
  const [logoPreview, setLogoPreview] = useState<string | null>(choir?.logoURL ?? null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [archiveOpen, setArchiveOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [transferTo, setTransferTo] = useState('')
  const [working, setWorking] = useState(false)

  const [ccliNumber, setCcliNumber] = useState(choir?.licensing?.ccliNumber ?? '')
  const [attested, setAttested] = useState(choir?.licensing?.attested ?? false)
  const [licensingSaving, setLicensingSaving] = useState(false)
  const [licensingSaved, setLicensingSaved] = useState(false)

  if (!choir) return null

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      let logoURL = choir.logoURL
      if (logoFile) {
        const fRef = storageRef(storage, `choirs/${choir.id}/logo`)
        await uploadBytes(fRef, logoFile)
        logoURL = await getDownloadURL(fRef)
      }
      await updateDoc(doc(db, 'choirs', choir.id), {
        name: name.trim(),
        churchName: churchName.trim() || null,
        description: description.trim() || null,
        logoURL: logoURL ?? null,
        updatedAt: serverTimestamp(),
      })
      await refreshChoir()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Save choir error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    setWorking(true)
    try {
      /* API_POINT: Firestore — archiving hides the choir; a Cloud Function could
         later purge or export its data. Marking a flag for now. */
      await updateDoc(doc(db, 'choirs', choir.id), { archived: true, updatedAt: serverTimestamp() })
      setArchiveOpen(false)
    } finally { setWorking(false) }
  }

  const handleTransfer = async () => {
    if (!transferTo || !firebaseUser) return
    setWorking(true)
    try {
      // New owner becomes director; ownership moves
      await updateDoc(doc(db, 'choirs', choir.id), { ownerId: transferTo, updatedAt: serverTimestamp() })
      await updateMemberRole(choir.id, transferTo, 'director')
      await refreshChoir()
      await refreshMembers()
      setTransferOpen(false)
    } catch (err) {
      console.error('Transfer ownership error:', err)
      setError('Transfer failed. Please try again.')
    } finally { setWorking(false) }
  }

  const handleSaveLicensing = async () => {
    if (!firebaseUser) return
    setLicensingSaving(true)
    setError(null)
    try {
      const trimmed = ccliNumber.trim()
      await updateDoc(doc(db, 'choirs', choir.id), {
        licensing: {
          ccliNumber: trimmed || null,
          attested,
          attestedBy: attested ? firebaseUser.uid : null,
          attestedAt: attested ? serverTimestamp() : null,
        },
        updatedAt: serverTimestamp(),
      })
      await refreshChoir()
      setLicensingSaved(true)
      setTimeout(() => setLicensingSaved(false), 2000)
    } catch (err) {
      console.error('Save licensing error:', err)
      setError('Could not save licensing details. Please try again.')
    } finally {
      setLicensingSaving(false)
    }
  }

  const otherMembers = members.filter(m => m.uid !== choir.ownerId)
  const licensingDirty =
    (choir.licensing?.ccliNumber ?? '') !== ccliNumber.trim() ||
    (choir.licensing?.attested ?? false) !== attested
  const attestedAtDate =
    choir.licensing?.attestedAt instanceof Date
      ? choir.licensing.attestedAt
      : choir.licensing?.attestedAt
        ? new Date(choir.licensing.attestedAt as unknown as string)
        : null

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-2xl mx-auto md:px-8">
        <PageHeader title="Choir settings" back="/settings" />

        {/* Editable details */}
        <Card className="p-6 mb-5 space-y-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <img src={logoPreview} alt="Choir logo" className="w-16 h-16 rounded-full object-cover border-2 border-harmonic-border" />
            ) : (
              <Avatar name={name || 'Choir'} size="lg" />
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 text-sm font-medium text-harmonic-primary hover:opacity-80 min-h-[44px]"
            >
              <Upload size={16} aria-hidden="true" /> Change logo
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)) } }}
              aria-hidden="true" />
          </div>

          <Input label="Choir name" value={name} onChange={e => setName(e.target.value)} />
          <Input label="Church name" value={churchName} onChange={e => setChurchName(e.target.value)} />
          <Textarea label="Description" placeholder="A short description of your choir" value={description} onChange={e => setDescription(e.target.value)} />

          {error && (
            <p role="alert" className="text-sm text-harmonic-danger">{error}</p>
          )}

          <div className="flex justify-end">
            <Button variant="primary" onClick={handleSave} disabled={!name.trim() || saving}>
              {saved ? <><Check size={16} /> Saved</> : saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </Card>

        {/* Library licensing */}
        <section className="mb-5">
          <h3 className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-3">Library licensing</h3>
          <Card className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <FileCheck2 size={18} className="text-harmonic-primary shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-harmonic-muted">
                Record your CCLI licence so directors can attach copyrighted songs and lyrics to set lists. Songs marked
                "CCLI required" will be visible to your choir once a licence is attested.
              </p>
            </div>

            <Input
              label="CCLI licence number"
              placeholder="e.g. 1234567"
              value={ccliNumber}
              onChange={e => setCcliNumber(e.target.value)}
              inputMode="numeric"
            />

            <Toggle
              checked={attested}
              onCheckedChange={setAttested}
              label="I attest this choir holds a current CCLI licence"
              description="By toggling this on, you confirm responsibility for licence compliance."
            />

            {attestedAtDate && choir.licensing?.attested && (
              <p className="text-xs text-harmonic-muted">
                Last attested {attestedAtDate.toLocaleDateString()} at {attestedAtDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}

            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleSaveLicensing}
                disabled={!licensingDirty || licensingSaving}
              >
                {licensingSaved ? <><Check size={16} /> Saved</> : licensingSaving ? 'Saving…' : 'Save licensing'}
              </Button>
            </div>
          </Card>
        </section>

        {/* Members with roles */}
        <section className="mb-5">
          <h3 className="text-xs font-semibold text-harmonic-muted uppercase tracking-widest mb-3">Members</h3>
          <Card className="divide-y divide-harmonic-border">
            {members.map(m => (
              <div key={m.uid} className="flex items-center gap-3 px-4 py-3">
                <Avatar src={m.photoURL} name={m.preferredName || m.displayName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-harmonic-text truncate">{m.preferredName || m.displayName}</p>
                  <p className="text-xs text-harmonic-muted">{voicePartLabel[m.voicePart] ?? m.voicePart}</p>
                </div>
                <Badge tone={m.role === 'director' ? 'primary' : 'muted'}>{m.role === 'director' ? 'Director' : 'Member'}</Badge>
              </div>
            ))}
          </Card>
        </section>

        {/* Danger zone */}
        <section>
          <h3 className="text-xs font-semibold text-harmonic-danger uppercase tracking-widest mb-3">Danger zone</h3>
          <Card className="p-5 space-y-3 border border-harmonic-danger/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-harmonic-text">Transfer ownership</p>
                <p className="text-xs text-harmonic-muted">Hand the choir over to another member.</p>
              </div>
              <Button variant="outlined" size="sm" onClick={() => setTransferOpen(true)} disabled={otherMembers.length === 0}>
                <UserCog size={16} /> Transfer
              </Button>
            </div>
            <div className="flex items-center justify-between gap-4 pt-3 border-t border-harmonic-border">
              <div>
                <p className="text-sm font-medium text-harmonic-text">Archive choir</p>
                <p className="text-xs text-harmonic-muted">Hide this choir and its data.</p>
              </div>
              <Button variant="danger" size="sm" onClick={() => setArchiveOpen(true)}>
                <Archive size={16} /> Archive
              </Button>
            </div>
          </Card>
        </section>
      </div>

      {/* Archive dialog */}
      <Modal open={archiveOpen} onOpenChange={setArchiveOpen} title="Archive this choir?"
        description="Members will lose access. This can be undone by support."
        footer={
          <>
            <Button variant="outlined" onClick={() => setArchiveOpen(false)} disabled={working}>Cancel</Button>
            <Button variant="danger" onClick={handleArchive} disabled={working}>{working ? 'Archiving…' : 'Archive'}</Button>
          </>
        }>
        <p className="text-sm text-harmonic-muted">{choir.name} will be hidden from everyone in the choir.</p>
      </Modal>

      {/* Transfer dialog */}
      <Modal open={transferOpen} onOpenChange={setTransferOpen} title="Transfer ownership"
        description="The new owner becomes a Director with full control."
        footer={
          <>
            <Button variant="outlined" onClick={() => setTransferOpen(false)} disabled={working}>Cancel</Button>
            <Button variant="primary" onClick={handleTransfer} disabled={!transferTo || working}>{working ? 'Transferring…' : 'Transfer'}</Button>
          </>
        }>
        <Select
          label="New owner"
          value={transferTo}
          onValueChange={setTransferTo}
          options={otherMembers.map(m => ({ value: m.uid, label: m.preferredName || m.displayName }))}
          placeholder="Choose a member"
        />
      </Modal>
    </AppLayout>
  )
}
