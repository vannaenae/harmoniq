import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthLogo } from '@/components/auth/AuthLogo'

export function ForgotPassword() {
  const { sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setError(null)
    setLoading(true)
    try {
      await sendPasswordReset(email.trim())
      setSent(true)
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'auth/user-not-found' || code === 'auth/invalid-email') {
        // Don't reveal whether account exists — always show success for security
        setSent(true)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-harmonic-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <AuthLogo />

        <div className="w-full bg-white rounded-card-lg p-6 shadow-card flex flex-col gap-5">
          {sent ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <CheckCircle2 size={48} className="text-harmonic-success" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-semibold text-harmonic-text">Check your inbox</h2>
                <p className="text-sm text-harmonic-muted mt-2">
                  If an account exists for <strong>{email}</strong>, we've sent a password reset link.
                  Check your spam folder if you don't see it.
                </p>
              </div>
              <Link to="/sign-in">
                <Button variant="primary" fullWidth>Back to sign in</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-lg font-semibold text-harmonic-text">Reset your password</h2>
                <p className="text-sm text-harmonic-muted mt-0.5">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              {error && (
                <div role="alert" className="bg-red-50 border border-harmonic-danger/20 rounded-xl px-4 py-3 text-sm text-harmonic-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <Input
                  type="email"
                  label="Email address"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />

                <Button type="submit" variant="primary" fullWidth disabled={loading || !email}>
                  {loading ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>

              <Link
                to="/sign-in"
                className="flex items-center justify-center gap-1.5 text-sm text-harmonic-muted hover:text-harmonic-text transition-colors"
              >
                <ArrowLeft size={14} aria-hidden="true" />
                Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
