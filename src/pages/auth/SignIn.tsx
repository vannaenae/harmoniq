import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthLogo } from '@/components/auth/AuthLogo'

export function SignIn() {
  const { signInWithGoogle, signInWithEmail, harmonicUser } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (harmonicUser) {
    const pendingInvite = localStorage.getItem('harmonic_pending_invite')
    if (pendingInvite && !harmonicUser.choirId) {
      navigate(`/join/${pendingInvite}`, { replace: true })
      return null
    }
    navigate(harmonicUser.onboardingComplete ? '/dashboard' : '/onboarding/role', { replace: true })
    return null
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setError(null)
    setLoading(true)
    try {
      await signInWithEmail(email.trim(), password)
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Incorrect email or password. Please try again.')
      } else if (code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a moment and try again.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'auth/popup-blocked') {
        setError('Pop-up was blocked. Please allow pop-ups for this site and try again.')
      } else if (code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-harmonic-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <AuthLogo />

        <div className="w-full bg-white rounded-card-lg p-6 shadow-card flex flex-col gap-5">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-harmonic-text">Welcome back</h2>
            <p className="text-sm text-harmonic-muted mt-0.5">Sign in to your choir workspace</p>
          </div>

          {error && (
            <div role="alert" className="bg-red-50 border border-harmonic-danger/20 rounded-xl px-4 py-3 text-sm text-harmonic-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSignIn} className="flex flex-col gap-4" noValidate>
            <Input
              type="email"
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-[38px] text-harmonic-muted hover:text-harmonic-text"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="flex justify-end -mt-2">
              <Link to="/forgot-password" className="text-xs text-harmonic-primary hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" variant="primary" fullWidth disabled={loading || !email || !password}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-harmonic-border" />
            <span className="text-xs text-harmonic-muted font-medium">or</span>
            <div className="flex-1 h-px bg-harmonic-border" />
          </div>

          <Button
            variant="inverted"
            fullWidth
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            aria-label="Continue with Google"
          >
            {!googleLoading && (
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            )}
            {googleLoading ? 'Signing in…' : 'Continue with Google'}
          </Button>

          <p className="text-center text-sm text-harmonic-muted">
            Don't have an account?{' '}
            <Link to="/sign-up" className="font-semibold text-harmonic-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-xs text-harmonic-muted text-center">
          By signing in you agree to our{' '}
          <Link to="/terms" className="underline hover:text-harmonic-text">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="underline hover:text-harmonic-text">Privacy Policy</Link>.
        </p>
        <p className="text-xs text-harmonic-muted">
          A <span className="font-semibold" style={{ color: '#560056' }}>SoulSPCE</span> project
        </p>
      </div>
    </div>
  )
}
