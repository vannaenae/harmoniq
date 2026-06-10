import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@harmoniq/shared'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthLogo } from '@/components/auth/AuthLogo'
import { Icon } from '@/components/ui/Icon'

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
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string; general?: string }>({})

  if (harmonicUser) {
    navigate(harmonicUser.onboardingComplete ? '/dashboard' : '/onboarding/role', { replace: true })
    return null
  }

  const validate = () => {
    const errors: { name?: string; email?: string; password?: string; confirmPassword?: string; general?: string } = {}
    if (!name.trim()) errors.name = 'Please enter your name.'
    if (!email.trim()) errors.email = 'Please enter your email.'
    if (password.length < 8) errors.password = 'Password must be at least 8 characters.'
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match.'
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setFormErrors({}) // Clear previous errors
    setLoading(true)
    try {
      await signUpWithEmail(email.trim(), password, name.trim())
      navigate('/verify-email', { replace: true })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code
      if (code === 'auth/email-already-in-use') {
        setFormErrors({ general: 'An account with this email already exists. Try signing in instead.' })
      } else if (code === 'auth/invalid-email') {
        setFormErrors({ general: 'Please enter a valid email address.' })
      } else if (code === 'auth/weak-password') {
        setFormErrors({ general: 'Choose a stronger password (at least 8 characters).' })
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
        setFormErrors({ general: 'Pop-up was blocked. Please allow pop-ups and try again.' })
      } else if (code !== 'auth/popup-closed-by-user') {
        setFormErrors({ general: 'Google sign-in failed. Please try again.' })
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

          {formErrors.general && (
            <div role="alert" className="bg-red-50 border border-harmonic-danger/20 rounded-xl px-4 py-3 text-sm text-harmonic-danger">
              {formErrors.general}
            </div>
          )}

          <form onSubmit={handleSignUp} className="flex flex-col gap-4" noValidate>
            <Input
              label="Your name"
              placeholder="Grace Adeyemi"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
              name="name"
              error={formErrors.name}
              required
            />

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
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
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
                name="confirm-password"
                error={formErrors.confirmPassword}
                required
              />
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
              <Icon name="google" size={18} />
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

