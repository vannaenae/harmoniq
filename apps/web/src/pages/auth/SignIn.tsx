import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@harmoniq/shared'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthLogo } from '@/components/auth/AuthLogo'
import { Icon } from '@/components/ui/Icon'

export function SignIn() {
  const { signInWithGoogle, signInWithEmail, harmonicUser } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [formErrors, setFormErrors] = useState<{ email?: string; password?: string; general?: string }>({})

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
    setFormErrors({}) // Clear previous errors

    const errors: { email?: string; password?: string; general?: string } = {}
    if (!email.trim()) errors.email = 'Please enter your email.'
    if (!password) errors.password = 'Please enter your password.'
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setLoading(true)
    try {
      await signInWithEmail(email.trim(), password)
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setFormErrors({ general: 'Incorrect email or password. Please try again.' })
      } else if (code === 'auth/too-many-requests') {
        setFormErrors({ general: 'Too many attempts. Please wait a moment and try again.' })
      } else {
        setFormErrors({ general: 'Something went wrong. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setFormErrors({}) // Clear previous errors
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'auth/popup-blocked') {
        setFormErrors({ general: 'Pop-up was blocked. Please allow pop-ups for this site and try again.' })
      } else if (code !== 'auth/popup-closed-by-user') {
        setFormErrors({ general: 'Google sign-in failed. Please try again.' })
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

          {formErrors.general && (
            <div role="alert" className="bg-red-50 border border-harmonic-danger/20 rounded-xl px-4 py-3 text-sm text-harmonic-danger">
              {formErrors.general}
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
              name="email"
              error={formErrors.email}
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
                name="password"
                error={formErrors.password}
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
              <Icon name="google" size={18} />
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
          A <span className="font-semibold text-harmonic-secondary">SoulSPCE</span> project
        </p>
      </div>
    </div>
  )
}

