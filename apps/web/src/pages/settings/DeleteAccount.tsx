import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, deleteDoc } from 'firebase/firestore'
import { deleteUser } from 'firebase/auth'
import { AlertTriangle } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/ui/PageHeader'
import { db, auth } from '@harmoniq/shared'
import { useAuth } from '@harmoniq/shared'
import { useChoir } from '@harmoniq/shared'

export function DeleteAccount() {
  const navigate = useNavigate()
  const { firebaseUser, signOut } = useAuth()
  const { choir } = useChoir()
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canDelete = confirmText.trim().toUpperCase() === 'DELETE'

  const handleDelete = async () => {
    if (!canDelete || !firebaseUser) return
    setError(null)
    setDeleting(true)
    try {
      /* API_POINT: Firestore — permanently remove the user's records.
         Their membership doc in the choir is removed; the user doc is deleted.
         A Cloud Function could cascade further cleanup (availability, attendance). */
      if (choir) {
        await deleteDoc(doc(db, 'choirs', choir.id, 'members', firebaseUser.uid)).catch(() => {})
      }
      await deleteDoc(doc(db, 'users', firebaseUser.uid)).catch(() => {})

      // Remove the auth account (may require recent login)
      if (auth.currentUser) {
        await deleteUser(auth.currentUser).catch(async () => {
          // If reauth is required, sign out so they can re-authenticate
          await signOut()
        })
      }
      navigate('/sign-in', { replace: true })
    } catch (err) {
      console.error('Delete account error:', err)
      setError('We couldn\'t delete your account. Please sign out, sign back in, and try again.')
      setDeleting(false)
    }
  }

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-md mx-auto md:px-8">
        <PageHeader title="Delete account" back="/settings" />

        <Card className="p-6">
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-14 h-14 rounded-full bg-harmonic-danger/10 flex items-center justify-center mb-3">
              <AlertTriangle size={26} className="text-harmonic-danger" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-harmonic-text">This can't be undone</h2>
            <p className="text-sm text-harmonic-muted mt-1">Deleting your account will permanently:</p>
          </div>

          <ul className="text-sm text-harmonic-text space-y-2 mb-5">
            <li className="flex gap-2"><span className="text-harmonic-danger">•</span> Remove you from {choir?.name ?? 'your choir'}</li>
            <li className="flex gap-2"><span className="text-harmonic-danger">•</span> Delete your profile and preferences</li>
            <li className="flex gap-2"><span className="text-harmonic-danger">•</span> Erase your availability and attendance records</li>
          </ul>

          {error && (
            <div role="alert" className="bg-red-50 border border-harmonic-danger/20 rounded-xl px-4 py-3 text-sm text-harmonic-danger mb-4">
              {error}
            </div>
          )}

          <Input
            label='Type "DELETE" to confirm'
            placeholder="DELETE"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            className="mb-4"
          />

          <Button variant="danger" fullWidth onClick={handleDelete} disabled={!canDelete || deleting}>
            {deleting ? 'Deleting…' : 'Permanently delete my account'}
          </Button>
        </Card>
      </div>
    </AppLayout>
  )
}
