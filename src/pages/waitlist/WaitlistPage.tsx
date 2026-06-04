import { useState, useEffect, type FormEvent } from 'react'
import { collection, addDoc, getCountFromServer, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { cn } from '@/lib/utils'
import {
  Music2,
  CalendarCheck,
  Users,
  Megaphone,
  CheckCircle,
  ArrowRight,
  Mic2,
  BookOpen,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Role = 'director' | 'vocalist' | 'musician' | ''

interface WaitlistEntry {
  email: string
  choirName: string
  role: Role
  createdAt: ReturnType<typeof serverTimestamp>
}

// ─── Feature cards ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Music2,
    title: 'Set Lists',
    description: 'Build service set lists, assign keys, and publish them instantly to the whole team.',
  },
  {
    icon: CalendarCheck,
    title: 'Availability',
    description: 'Members confirm or decline each service in one tap. Directors see the full picture at a glance.',
  },
  {
    icon: BookOpen,
    title: 'Song Library',
    description: '1,000+ worship songs with keys, lyrics, YouTube links, and rehearsal notes — all searchable.',
  },
  {
    icon: Megaphone,
    title: 'Announcements',
    description: 'Replace scattered WhatsApp threads with a structured choir announcement feed.',
  },
]

// ─── Problems / solutions ──────────────────────────────────────────────────────

const PROBLEMS = [
  'Chasing availability over WhatsApp the night before a service',
  'Emailing PDFs back and forth every week',
  'No central place for rehearsal notes or song keys',
  'Members showing up unprepared because they missed the update',
]

const SOLUTIONS = [
  'One-tap availability so the director always knows who\'s in',
  'Live set lists published to every member\'s phone',
  'Song library with keys, lyrics, and YouTube links built in',
  'Announcements that everyone actually sees',
]

// ─── WaitlistPage ──────────────────────────────────────────────────────────────

export function WaitlistPage() {
  const [email, setEmail] = useState('')
  const [choirName, setChoirName] = useState('')
  const [role, setRole] = useState<Role>('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupCount, setSignupCount] = useState<number | null>(null)
  const [toast, setToast] = useState(false)

  // Load live signup count
  useEffect(() => {
    async function fetchCount() {
      try {
        const snap = await getCountFromServer(collection(db, 'waitlist'))
        setSignupCount(snap.data().count)
      } catch {
        // non-critical — silently ignore
      }
    }
    fetchCount()
  }, [submitted])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!emailOk) {
      setError('Please enter a valid email address.')
      return
    }

    setSubmitting(true)
    try {
      const entry: WaitlistEntry = {
        email: email.trim().toLowerCase(),
        choirName: choirName.trim(),
        role,
        createdAt: serverTimestamp(),
      }
      await addDoc(collection(db, 'waitlist'), entry)
      setSubmitted(true)
      setToast(true)
      setTimeout(() => setToast(false), 4000)
    } catch (err) {
      console.error('Waitlist submit error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-harmonic-background font-sans">

      {/* ── Toast ── */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            'fixed top-4 left-1/2 -translate-x-1/2 z-50',
            'flex items-center gap-2 bg-harmonic-neutral text-white',
            'px-5 py-3 rounded-pill shadow-card text-sm font-medium',
            'transition-all duration-300',
          )}
        >
          <CheckCircle size={16} />
          You're on the list!
        </div>
      )}

      {/* ── Nav ── */}
      <header className="sticky top-0 z-40 bg-harmonic-background/90 backdrop-blur border-b border-harmonic-border">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-black italic text-harmonic-primary text-xl tracking-tight">Harmoniq</span>
          <a
            href="#signup"
            className={cn(
              'text-xs font-semibold px-4 py-2 rounded-pill',
              'bg-harmonic-primary text-white hover:opacity-90 transition-opacity',
            )}
          >
            Join waitlist
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="bg-featured-song-gradient text-white px-4 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 bg-white/10 rounded-pill px-4 py-1.5 text-xs font-semibold uppercase tracking-widest">
            <Mic2 size={12} />
            Early access
          </div>
          <h1 className="text-4xl sm:text-5xl font-black italic tracking-tight leading-tight">
            Vocal excellence,<br />coordinated.
          </h1>
          <p className="text-base sm:text-lg text-white/80 max-w-md leading-relaxed">
            Harmoniq is the all-in-one operating system for worship choirs — set lists,
            availability, song library, and announcements in one calm app.
          </p>
          {signupCount !== null && signupCount > 0 && (
            <p className="text-sm text-white/60">
              <span className="text-white font-semibold">{signupCount.toLocaleString()}</span> choirs already waiting
            </p>
          )}
          <a
            href="#signup"
            className={cn(
              'inline-flex items-center gap-2 bg-white text-harmonic-primary',
              'font-semibold px-8 py-3 rounded-pill hover:opacity-90 transition-opacity',
              'text-sm mt-2',
            )}
          >
            Get early access <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* ── Problem / Solution ── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-harmonic-text text-center mb-12 tracking-tight">
            Choir coordination is broken.<br />We fixed it.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Problems */}
            <div className="bg-white rounded-card border border-harmonic-border p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-widest text-harmonic-muted mb-4">
                The problem
              </p>
              <ul className="space-y-3">
                {PROBLEMS.map(p => (
                  <li key={p} className="flex items-start gap-3 text-sm text-harmonic-text leading-snug">
                    <span className="mt-0.5 w-4 h-4 rounded-full bg-harmonic-danger/10 flex items-center justify-center flex-shrink-0">
                      <span className="block w-1.5 h-1.5 rounded-full bg-harmonic-danger" />
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            {/* Solutions */}
            <div className="bg-white rounded-card border border-harmonic-border p-6 shadow-card">
              <p className="text-xs font-semibold uppercase tracking-widest text-harmonic-muted mb-4">
                Harmoniq
              </p>
              <ul className="space-y-3">
                {SOLUTIONS.map(s => (
                  <li key={s} className="flex items-start gap-3 text-sm text-harmonic-text leading-snug">
                    <CheckCircle size={16} className="mt-0.5 text-harmonic-success flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="py-16 px-4 bg-white border-y border-harmonic-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-harmonic-muted text-center mb-3">
            What's inside
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-harmonic-text text-center mb-10 tracking-tight">
            Everything your choir needs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-start gap-4 p-5 rounded-card border border-harmonic-border hover:shadow-card-hover transition-shadow"
              >
                <div className="w-10 h-10 rounded-card bg-featured-song-gradient-light flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-harmonic-primary" />
                </div>
                <div>
                  <p className="font-semibold text-harmonic-text text-sm mb-1">{title}</p>
                  <p className="text-xs text-harmonic-muted leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-harmonic-muted mb-3">
            Built for
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-harmonic-text mb-8 tracking-tight">
            Directors and vocalists, both
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-card border border-harmonic-border p-6 shadow-card text-left">
              <div className="w-10 h-10 rounded-card bg-featured-song-gradient-light flex items-center justify-center mb-4">
                <Users size={18} className="text-harmonic-primary" />
              </div>
              <p className="font-semibold text-harmonic-text mb-2">Directors</p>
              <p className="text-sm text-harmonic-muted leading-relaxed">
                Build set lists, track who's available, broadcast announcements, and manage your
                whole choir from one screen.
              </p>
            </div>
            <div className="bg-white rounded-card border border-harmonic-border p-6 shadow-card text-left">
              <div className="w-10 h-10 rounded-card bg-featured-song-gradient-light flex items-center justify-center mb-4">
                <Mic2 size={18} className="text-harmonic-primary" />
              </div>
              <p className="font-semibold text-harmonic-text mb-2">Vocalists &amp; Musicians</p>
              <p className="text-sm text-harmonic-muted leading-relaxed">
                See what's next, confirm your availability, and access the full song library with
                keys and lyrics — all in one calm view.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Signup form ── */}
      <section id="signup" className="py-16 px-4 bg-featured-song-gradient">
        <div className="max-w-md mx-auto">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-widest text-center mb-3">
            Early access
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-2 tracking-tight">
            Be first to know
          </h2>
          <p className="text-white/70 text-sm text-center mb-8">
            We're opening up choir by choir. Drop your email and we'll reach out when it's your turn.
          </p>

          {submitted ? (
            <div className="bg-white/10 rounded-card-lg p-8 text-center flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle size={28} className="text-white" />
              </div>
              <p className="text-white font-semibold text-lg">You're on the list!</p>
              <p className="text-white/70 text-sm">
                We'll email you at <span className="text-white font-medium">{email}</span> when
                Harmoniq is ready for your choir.
              </p>
              {signupCount !== null && signupCount > 0 && (
                <p className="text-white/50 text-xs">
                  {signupCount.toLocaleString()} choirs waiting
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="wl-email" className="text-sm font-medium text-white/90">
                  Email address <span className="text-white/50">(required)</span>
                </label>
                <input
                  id="wl-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@yourchurch.org"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className={cn(
                    'bg-white/10 border border-white/20 text-white placeholder:text-white/40',
                    'rounded-pill px-4 py-3 text-sm outline-none',
                    'focus:border-white/60 transition-colors min-h-[44px]',
                    error && 'border-red-300',
                  )}
                />
              </div>

              {/* Choir name */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="wl-choir" className="text-sm font-medium text-white/90">
                  Choir or church name <span className="text-white/50">(optional)</span>
                </label>
                <input
                  id="wl-choir"
                  type="text"
                  autoComplete="organization"
                  placeholder="Grace Community Choir"
                  value={choirName}
                  onChange={e => setChoirName(e.target.value)}
                  className={cn(
                    'bg-white/10 border border-white/20 text-white placeholder:text-white/40',
                    'rounded-pill px-4 py-3 text-sm outline-none',
                    'focus:border-white/60 transition-colors min-h-[44px]',
                  )}
                />
              </div>

              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="wl-role" className="text-sm font-medium text-white/90">
                  Your role <span className="text-white/50">(optional)</span>
                </label>
                <select
                  id="wl-role"
                  value={role}
                  onChange={e => setRole(e.target.value as Role)}
                  className={cn(
                    'bg-white/10 border border-white/20 text-white',
                    'rounded-pill px-4 py-3 text-sm outline-none appearance-none',
                    'focus:border-white/60 transition-colors min-h-[44px]',
                    !role && 'text-white/40',
                  )}
                >
                  <option value="" className="text-harmonic-text bg-white">Select a role…</option>
                  <option value="director" className="text-harmonic-text bg-white">Choir Director</option>
                  <option value="vocalist" className="text-harmonic-text bg-white">Vocalist</option>
                  <option value="musician" className="text-harmonic-text bg-white">Musician / Instrumentalist</option>
                </select>
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-200">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  'mt-2 w-full bg-white text-harmonic-primary font-semibold',
                  'px-8 py-3 rounded-pill hover:opacity-90 transition-opacity',
                  'text-sm min-h-[44px] flex items-center justify-center gap-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                {submitting ? 'Joining…' : (
                  <>
                    Join the waitlist <ArrowRight size={16} />
                  </>
                )}
              </button>

              {signupCount !== null && signupCount > 0 && (
                <p className="text-center text-white/50 text-xs">
                  {signupCount.toLocaleString()} choirs already waiting
                </p>
              )}
            </form>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-harmonic-neutral text-white/60 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span className="font-black italic text-white text-base tracking-tight">Harmoniq</span>
          <p>Vocal excellence, coordinated.</p>
          <p>© {new Date().getFullYear()} Harmoniq. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
