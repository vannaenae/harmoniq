import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthLogo } from '@/components/auth/AuthLogo'

export function SignUp() {
  const { signUpWithEmail, signInWithGoogle, harmonicUser } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (harmonicUser) {
    navigate(harmonicUser.onboardingComplete ? '/dashboard' : '/onboarding/role', { replace: true })
    return null
  }

  const validate = (): string | null => {
    if (!name.trim()) return 'Please enter your name.'
    if (!email.trim()) return 'Please enter your email.'
    if (password.length < 8) return 'Password must be at least 8 characters.'
    if (password !== confirmPassword) return 'Passwords do not match.'
    return null
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) { setError(validationError); return }

    setError(null)
    setLoading(true)
    try {
      await signUpWithEmail(email.trim(), password, name.trim())
      navigate('/verify-email', { replace: true })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Try signing in instead.')
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.')
      } else if (code === 'auth/weak-password') {
        setError('Choose a stronger password (at least 8 characters).')
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
        setError('Pop-up was blocked. Please allow pop-ups and try again.')
      } else if (code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  const strengthLevel = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3
  const strengthLabel = ['', 'Too short', 'Good', 'Strong'][strengthLevel]
  const strengthColor = ['', 'bg-harmonic-danger', 'bg-yellow-400', 'bg-harmonic-success'][strengthLevel]

  return (
    <div className="min-h-screen bg-harmonic-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <AuthLogo />

        <div className="w-full bg-white rounded-card-lg p-6 shadow-card flex flex-col gap-5">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-harmonic-text">Create your account</h2>
            <p className="text-sm text-harmonic-muted mt-0.5">Join your choir on Harmoniq</p>
          </div>

          {error && (
            <div role="alert" className="bg-red-50 border border-harmonic-danger/20 rounded-xl px-4 py-3 text-sm text-harmonic-danger">
              {error}
            </div>
          )}

          <form onSubmit={handleSignUp} className="flex flex-col gap-4" noValidate>
            <div className="relative">
              <Input
                label="Your name"
                placeholder="Grace Adeyemi"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                required
              />
              <User size={16} className="absolute left-3 top-[38px] text-harmonic-muted pointer-events-none" aria-hidden="true" />
            </div>

            <div className="relative">
              <Input
                type="email"
                label="Email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <Mail size={16} className="absolute left-3 top-[38px] text-harmonic-muted pointer-events-none" aria-hidden="true" />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <Lock size={16} className="absolute left-3 top-[38px] text-harmonic-muted pointer-events-none" aria-hidden="true" />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-[38px] text-harmonic-muted hover:text-harmonic-text"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-harmonic-surface rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${strengthColor}`}
                      style={{ width: `${(strengthLevel / 3) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-harmonic-muted">{strengthLabel}</span>
                </div>
              )}
            </div>

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                label="Confirm password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <Lock size={16} className="absolute left-3 top-[38px] text-harmonic-muted pointer-events-none" aria-hidden="true" />
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading || !name || !email || !password || !confirmPassword}
            >
              {loading ? 'Creating account…' : 'Create account'}
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
          >
            {!googleLoading && (
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            )}
            {googleLoading ? 'Signing up…' : 'Sign up with Google'}
          </Button>

          <p className="text-center text-sm text-harmonic-muted">
            Already have an account?{' '}
            <Link to="/sign-in" className="font-semibold text-harmonic-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-xs text-harmonic-muted text-center">
          By creating an account you agree to our{' '}
          <Link to="/terms" className="underline hover:text-harmonic-text">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="underline hover:text-harmonic-text">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
