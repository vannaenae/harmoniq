import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, RefreshCw } from 'lucide-react'
import { sendEmailVerification } from 'firebase/auth'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { AuthLogo } from '@/components/auth/AuthLogo'

export function VerifyEmail() {
  const { firebaseUser, signOut } = useAuth()
  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleResend = async () => {
    if (!firebaseUser) return
    setLoading(true)
    try {
      await sendEmailVerification(firebaseUser)
      setResent(true)
    } catch {
      // silently ignore rate-limit errors
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-harmonic-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <AuthLogo />

        <div className="w-full bg-white rounded-card-lg p-6 shadow-card flex flex-col items-center gap-5 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center bg-harmonic-primary"
          >
            <Mail size={28} className="text-white" aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-harmonic-text">Verify your email</h2>
            <p className="text-sm text-harmonic-muted mt-2">
              We've sent a verification link to{' '}
              <strong className="text-harmonic-text">{firebaseUser?.email}</strong>.
              Click the link in that email to activate your account.
            </p>
          </div>

          {resent && (
            <div className="w-full bg-green-50 border border-harmonic-success/20 rounded-xl px-4 py-3 text-sm text-harmonic-success">
              Verification email resent! Check your inbox (and spam folder).
            </div>
          )}

          <Button
            variant="outlined"
            fullWidth
            onClick={handleResend}
            disabled={loading || resent}
          >
            <RefreshCw size={16} aria-hidden="true" />
            {loading ? 'Sending…' : resent ? 'Email sent!' : 'Resend verification email'}
          </Button>

          <p className="text-sm text-harmonic-muted">
            Once verified,{' '}
            <Link to="/sign-in" className="text-harmonic-primary font-medium hover:underline">
              sign in again
            </Link>{' '}
            to continue.
          </p>

          <button
            onClick={signOut}
            className="text-xs text-harmonic-muted hover:text-harmonic-text transition-colors"
          >
            Sign out and use a different account
          </button>
        </div>
      </div>
    </div>
  )
}
