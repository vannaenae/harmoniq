import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'

/* API_POINT: Firebase Auth — Google Sign-In, initiated here */
export function SignIn() {
  const { signInWithGoogle, harmonicUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
      // Routing handled by App.tsx based on onboardingComplete flag
    } catch (err) {
      console.error('Sign-in error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // If already signed in, redirect
  if (harmonicUser) {
    navigate(harmonicUser.onboardingComplete ? '/dashboard' : '/onboarding/role', { replace: true })
    return null
  }

  return (
    <div className="min-h-screen bg-harmonic-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">

        {/* Logo mark */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #18005F 0%, #560056 100%)' }}
            aria-hidden="true"
          >
            {/* Music note SVG mark */}
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path
                d="M22 8v10.5a3.5 3.5 0 1 1-2-3.18V10.5l-8 2V22.5a3.5 3.5 0 1 1-2-3.18V9l12-3V8z"
                fill="white"
              />
            </svg>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-harmonic-text tracking-tight">Harmonic</h1>
            <p className="text-harmonic-muted text-sm mt-1 font-medium">
              Built for worship teams. Not spreadsheets.
            </p>
          </div>
        </div>

        {/* Sign-in card */}
        <div className="w-full bg-white rounded-card-lg p-6 shadow-card flex flex-col gap-4">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-harmonic-text">Welcome</h2>
            <p className="text-sm text-harmonic-muted mt-0.5">Sign in to your choir workspace</p>
          </div>

          {error && (
            <div
              role="alert"
              className="bg-red-50 border border-harmonic-danger/20 rounded-xl px-4 py-3 text-sm text-harmonic-danger"
            >
              {error}
            </div>
          )}

          <Button
            variant="inverted"
            fullWidth
            onClick={handleGoogleSignIn}
            disabled={loading}
            aria-label="Sign in with Google"
          >
            {!loading && (
              /* Google G logo */
              <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.909-2.259c-.806.54-1.837.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            )}
            {loading ? 'Signing in…' : 'Sign in with Google'}
          </Button>

          <p className="text-center text-xs text-harmonic-muted leading-relaxed">
            By signing in, you agree to our{' '}
            <a href="/terms" className="underline hover:text-harmonic-text transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-harmonic-text transition-colors">
              Privacy Policy
            </a>
            .
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-harmonic-muted text-center">
          A{' '}
          <span className="font-semibold" style={{ color: '#560056' }}>
            SoulSPCE
          </span>{' '}
          project
        </p>
      </div>
    </div>
  )
}
