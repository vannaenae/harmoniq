import { useState, useEffect, useRef, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { collection, addDoc, getCountFromServer, serverTimestamp } from 'firebase/firestore'
import { db } from '@harmoniq/shared'
import { cn } from '@harmoniq/shared'
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

// ─── useInView hook ───────────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}

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
  "One-tap availability so the director always knows who's in",
  "Live set lists published to every member's phone",
  'Song library with keys, lyrics, and YouTube links built in',
  'Announcements that everyone actually sees',
]

// ─── SVG Illustrations ────────────────────────────────────────────────────────

function ChoirHeroIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="robe-a" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#3D1DB5" />
          <stop offset="100%" stopColor="#560056" />
        </linearGradient>
        <linearGradient id="robe-b" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#18005F" />
          <stop offset="100%" stopColor="#3D1DB5" />
        </linearGradient>
        <linearGradient id="robe-c" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#560056" />
          <stop offset="100%" stopColor="#18005F" />
        </linearGradient>
        <filter id="soft-glow">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Stage floor glow */}
      <ellipse cx="240" cy="345" rx="190" ry="18" fill="rgba(255,255,255,0.07)" />

      {/* Concentric sound rings */}
      <circle cx="240" cy="210" r="90"  stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
      <circle cx="240" cy="210" r="145" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      <circle cx="240" cy="210" r="200" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

      {/* ── Far-left member (warm tan) ── */}
      <g transform="translate(28,185)">
        {/* head */}
        <circle cx="30" cy="0"  r="19" fill="#C8916B" />
        {/* hair */}
        <path d="M13,-7 Q30,-21 47,-7" fill="#3D1F0E" />
        {/* robe */}
        <path d="M10,17 L2,130 L58,130 L50,17 Q40,27 30,27 Q20,27 10,17Z" fill="url(#robe-b)" />
        {/* robe crease */}
        <path d="M22,30 L16,110" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      </g>

      {/* ── Second-left member (deep brown) ── */}
      <g transform="translate(107,148)">
        <circle cx="34" cy="0"  r="22" fill="#7B4A2D" />
        <path d="M14,-10 Q34,-24 54,-10" fill="#1A0A00" />
        <path d="M10,19 L2,138 L66,138 L58,19 Q46,30 34,30 Q22,30 10,19Z" fill="url(#robe-a)" />
        <path d="M24,32 L18,118" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      </g>

      {/* ── Centre member — conductor / lead (tallest) ── */}
      <g transform="translate(188,110)">
        <circle cx="40" cy="0"  r="26" fill="#C8A882" />
        {/* natural curls */}
        <path d="M16,-12 Q40,-30 64,-12 Q58,-4 50,-8 Q40,-12 30,-8 Q22,-4 16,-12Z" fill="#6B4226" />
        <path d="M12,23 L2,155 L78,155 L68,23 Q54,35 40,35 Q26,35 12,23Z" fill="url(#robe-c)" />
        <path d="M30,37 L22,135" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
        {/* raised baton arm */}
        <path d="M68,32 Q90,12 105,-6" stroke="#C8A882" strokeWidth="9" strokeLinecap="round" />
        <circle cx="105" cy="-6" r="4" fill="rgba(255,255,255,0.9)" />
        {/* baton */}
        <line x1="105" y1="-6" x2="130" y2="-26" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* ── Second-right member (light olive) ── */}
      <g transform="translate(299,148)">
        <circle cx="34" cy="0"  r="22" fill="#E8C49A" />
        <path d="M14,-10 Q34,-25 54,-10" fill="#B07840" />
        <path d="M10,19 L2,138 L66,138 L58,19 Q46,30 34,30 Q22,30 10,19Z" fill="url(#robe-b)" />
        <path d="M24,32 L18,118" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        {/* sheet music in hand */}
        <rect x="62" y="40" width="24" height="30" rx="3" fill="rgba(255,255,255,0.85)" />
        <line x1="66" y1="48" x2="82" y2="48" stroke="#18005F" strokeWidth="1.5" />
        <line x1="66" y1="54" x2="82" y2="54" stroke="#18005F" strokeWidth="1.5" />
        <line x1="66" y1="60" x2="76" y2="60" stroke="#18005F" strokeWidth="1.5" />
      </g>

      {/* ── Far-right member (warm medium) ── */}
      <g transform="translate(392,185)">
        <circle cx="30" cy="0"  r="19" fill="#A0714A" />
        <path d="M12,-7 Q30,-21 48,-7" fill="#3D200A" />
        <path d="M10,17 L2,130 L58,130 L50,17 Q40,27 30,27 Q20,27 10,17Z" fill="url(#robe-a)" />
        <path d="M22,30 L16,110" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      </g>

      {/* ── Floating music notes ── */}
      {/* Note — upper left */}
      <g transform="translate(62,80)" opacity="0.75">
        <circle cx="9"  cy="19" r="7"  fill="rgba(255,255,255,0.85)" />
        <line  x1="16" y1="19" x2="16" y2="-7"   stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" />
        <path  d="M16,-7 Q30,-13 30,-3"           stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" fill="none" />
      </g>

      {/* Double-note — top center */}
      <g transform="translate(196,38)" opacity="0.6">
        <circle cx="9"  cy="22" r="7"  fill="rgba(255,255,255,0.75)" />
        <circle cx="27" cy="18" r="7"  fill="rgba(255,255,255,0.75)" />
        <line  x1="16" y1="22" x2="16" y2="-8"   stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" />
        <line  x1="34" y1="18" x2="34" y2="-12"  stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" />
        <line  x1="16" y1="-8" x2="34" y2="-12"  stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" />
      </g>

      {/* Note — upper right */}
      <g transform="translate(372,74)" opacity="0.65">
        <circle cx="9"  cy="19" r="7"  fill="rgba(255,255,255,0.75)" />
        <line  x1="16" y1="19" x2="16" y2="-7"   stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" />
        <path  d="M16,-7 Q30,-13 30,-3"           stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" fill="none" />
      </g>

      {/* Small note — left shoulder area */}
      <g transform="translate(155,100)" opacity="0.45">
        <circle cx="6"  cy="13" r="5"  fill="rgba(255,255,255,0.7)" />
        <line  x1="11" y1="13" x2="11" y2="-4"   stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
        <path  d="M11,-4 Q21,-8 21,-1"            stroke="rgba(255,255,255,0.7)" strokeWidth="2" fill="none" />
      </g>

      {/* Small note — right area */}
      <g transform="translate(318,96)" opacity="0.45">
        <circle cx="6"  cy="13" r="5"  fill="rgba(255,255,255,0.7)" />
        <line  x1="11" y1="13" x2="11" y2="-4"   stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
        <path  d="M11,-4 Q21,-8 21,-1"            stroke="rgba(255,255,255,0.7)" strokeWidth="2" fill="none" />
      </g>

      {/* Sound wave arc under ensemble */}
      <path
        d="M60,290 Q120,270 180,290 Q240,310 300,290 Q360,270 420,290"
        stroke="rgba(255,255,255,0.12)" strokeWidth="2" fill="none" strokeLinecap="round"
      />
      <path
        d="M80,308 Q140,292 200,308 Q260,324 320,308 Q380,292 440,308"
        stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" fill="none" strokeLinecap="round"
      />
    </svg>
  )
}

function DirectorIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="dir-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#18005F" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#560056" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="dir-robe" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#3D1DB5" />
          <stop offset="100%" stopColor="#560056" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <circle cx="100" cy="100" r="90" fill="url(#dir-bg)" />

      {/* Person — skin: warm tan */}
      <circle cx="100" cy="62" r="22" fill="#C8916B" />
      {/* Hair */}
      <path d="M80,52 Q100,38 120,52 Q116,44 108,46 Q100,48 92,46 Q84,44 80,52Z" fill="#3D1F0E" />
      {/* Robe body */}
      <path d="M76,82 L68,162 L132,162 L124,82 Q112,92 100,92 Q88,92 76,82Z" fill="url(#dir-robe)" />

      {/* Tablet in left hand */}
      <rect x="108" y="95" width="30" height="38" rx="4" fill="rgba(255,255,255,0.92)" stroke="rgba(24,0,95,0.15)" strokeWidth="1" />
      <rect x="112" y="100" width="22" height="24" rx="2" fill="#EDE8F8" />
      <line x1="115" y1="106" x2="131" y2="106" stroke="#560056" strokeWidth="1.5" />
      <line x1="115" y1="111" x2="131" y2="111" stroke="#560056" strokeWidth="1.5" />
      <line x1="115" y1="116" x2="124" y2="116" stroke="#560056" strokeWidth="1.5" />
      {/* Home button */}
      <circle cx="123" cy="128" r="3" fill="rgba(24,0,95,0.15)" />

      {/* Baton arm raised */}
      <path d="M78,92 Q62,74 52,60" stroke="#C8916B" strokeWidth="9" strokeLinecap="round" />
      {/* Baton */}
      <line x1="52" y1="60" x2="36" y2="42" stroke="rgba(255,255,255,0.8)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="36" cy="42" r="3" fill="rgba(255,255,255,0.9)" />

      {/* Small floating notes */}
      <g opacity="0.6" transform="translate(28,30)">
        <circle cx="6" cy="12" r="5" fill="#560056" />
        <line x1="11" y1="12" x2="11" y2="-3" stroke="#560056" strokeWidth="2" />
        <path d="M11,-3 Q20,-7 20,-1" stroke="#560056" strokeWidth="2" fill="none" />
      </g>
      <g opacity="0.4" transform="translate(42,18)">
        <circle cx="5" cy="10" r="4" fill="#18005F" />
        <line x1="9" y1="10" x2="9" y2="-2" stroke="#18005F" strokeWidth="1.5" />
      </g>

      {/* Floor shadow */}
      <ellipse cx="100" cy="165" rx="42" ry="6" fill="rgba(24,0,95,0.1)" />
    </svg>
  )
}

function VocalistIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="voc-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#18005F" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#560056" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id="voc-robe" x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0%" stopColor="#18005F" />
          <stop offset="100%" stopColor="#560056" />
        </linearGradient>
      </defs>

      <circle cx="100" cy="100" r="90" fill="url(#voc-bg)" />

      {/* Sound waves — left */}
      <path d="M44,90 Q36,100 44,110" stroke="#18005F" strokeOpacity="0.3" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M36,80 Q22,100 36,120" stroke="#18005F" strokeOpacity="0.2" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M28,70 Q8,100 28,130"  stroke="#18005F" strokeOpacity="0.12" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Sound waves — right */}
      <path d="M156,90 Q164,100 156,110" stroke="#560056" strokeOpacity="0.3" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M164,80 Q178,100 164,120" stroke="#560056" strokeOpacity="0.2" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M172,70 Q192,100 172,130"  stroke="#560056" strokeOpacity="0.12" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Person — skin: deep brown */}
      <circle cx="100" cy="60" r="22" fill="#7B4A2D" />
      {/* Hair / afro */}
      <path
        d="M78,50 Q82,32 100,30 Q118,32 122,50 Q120,40 112,38 Q100,34 88,38 Q80,40 78,50Z"
        fill="#1A0A00"
      />
      {/* extra afro volume */}
      <ellipse cx="100" cy="38" rx="16" ry="10" fill="#1A0A00" />

      {/* Robe body */}
      <path d="M76,80 L68,162 L132,162 L124,80 Q112,90 100,90 Q88,90 76,80Z" fill="url(#voc-robe)" />

      {/* Arms slightly spread — singing posture */}
      <path d="M78,90 Q58,100 50,108" stroke="#7B4A2D" strokeWidth="9" strokeLinecap="round" />
      <path d="M122,90 Q142,100 150,108" stroke="#7B4A2D" strokeWidth="9" strokeLinecap="round" />

      {/* Sheet music in right hand */}
      <rect x="148" y="104" width="22" height="28" rx="3" fill="rgba(255,255,255,0.9)" />
      <line x1="152" y1="111" x2="166" y2="111" stroke="#18005F" strokeWidth="1.5" />
      <line x1="152" y1="117" x2="166" y2="117" stroke="#18005F" strokeWidth="1.5" />
      <line x1="152" y1="123" x2="162" y2="123" stroke="#18005F" strokeWidth="1.5" />

      {/* Floating notes */}
      <g opacity="0.55" transform="translate(62,28)">
        <circle cx="6"  cy="14" r="5"  fill="#560056" />
        <line  x1="11" y1="14" x2="11" y2="-1" stroke="#560056" strokeWidth="2" />
        <path  d="M11,-1 Q20,-5 20,1" stroke="#560056" strokeWidth="2" fill="none" />
      </g>
      <g opacity="0.4" transform="translate(128,22)">
        <circle cx="5"  cy="12" r="4" fill="#18005F" />
        <circle cx="19" cy="9"  r="4" fill="#18005F" />
        <line  x1="9"  y1="12" x2="9"  y2="-4" stroke="#18005F" strokeWidth="1.5" />
        <line  x1="23" y1="9"  x2="23" y2="-8" stroke="#18005F" strokeWidth="1.5" />
        <line  x1="9"  y1="-4" x2="23" y2="-8" stroke="#18005F" strokeWidth="1.5" />
      </g>

      <ellipse cx="100" cy="165" rx="42" ry="6" fill="rgba(24,0,95,0.08)" />
    </svg>
  )
}

function RehearsalIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="rhrs-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#18005F" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#560056" stopOpacity="0.10" />
        </linearGradient>
      </defs>

      <rect width="360" height="180" rx="12" fill="url(#rhrs-bg)" />

      {/* Music staff lines */}
      {[40, 52, 64, 76, 88].map((y, i) => (
        <line key={i} x1="20" y1={y} x2="340" y2={y} stroke="rgba(24,0,95,0.1)" strokeWidth="1" />
      ))}

      {/* Treble clef simplified */}
      <path
        d="M32,100 Q32,60 40,48 Q48,36 52,44 Q56,52 48,60 Q40,68 36,80 Q32,92 40,100 Q48,108 56,100 Q64,92 60,80"
        stroke="#18005F" strokeOpacity="0.35" strokeWidth="2" fill="none" strokeLinecap="round"
      />

      {/* Notes on staff */}
      {/* Quarter note 1 */}
      <g transform="translate(72,34)" opacity="0.7">
        <ellipse cx="10" cy="12" rx="8" ry="6" fill="#560056" transform="rotate(-15 10 12)" />
        <line x1="18" y1="10" x2="18" y2="-22" stroke="#560056" strokeWidth="2" />
      </g>

      {/* Eighth note 2 */}
      <g transform="translate(108,28)" opacity="0.65">
        <ellipse cx="10" cy="14" rx="8" ry="6" fill="#18005F" transform="rotate(-15 10 14)" />
        <line x1="18" y1="12" x2="18" y2="-18" stroke="#18005F" strokeWidth="2" />
        <path d="M18,-18 Q32,-24 32,-14" stroke="#18005F" strokeWidth="2" fill="none" />
      </g>

      {/* Rest symbol */}
      <path d="M152,48 L168,48 L160,62 L176,62" stroke="#560056" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />

      {/* Half note */}
      <g transform="translate(182,38)" opacity="0.6">
        <ellipse cx="10" cy="12" rx="8" ry="6" fill="none" stroke="#18005F" strokeWidth="2" transform="rotate(-15 10 12)" />
        <line x1="18" y1="10" x2="18" y2="-18" stroke="#18005F" strokeWidth="2" />
      </g>

      {/* Whole note */}
      <ellipse cx="228" cy="52" rx="8" ry="6" fill="none" stroke="#560056" strokeOpacity="0.6" strokeWidth="2.5" transform="rotate(-10 228 52)" />

      {/* Eighth note pair */}
      <g transform="translate(252,30)" opacity="0.55">
        <ellipse cx="10" cy="18" rx="8" ry="6" fill="#18005F" transform="rotate(-15 10 18)" />
        <ellipse cx="28" cy="14" rx="8" ry="6" fill="#18005F" transform="rotate(-15 28 14)" />
        <line x1="18" y1="16" x2="18" y2="-14" stroke="#18005F" strokeWidth="2" />
        <line x1="36" y1="12" x2="36" y2="-18" stroke="#18005F" strokeWidth="2" />
        <line x1="18" y1="-14" x2="36" y2="-18" stroke="#18005F" strokeWidth="2.5" />
      </g>

      {/* Bar line */}
      <line x1="300" y1="36" x2="300" y2="92" stroke="rgba(24,0,95,0.2)" strokeWidth="1.5" />

      {/* Three singers at bottom — simplified */}
      {/* Singer 1 */}
      <circle cx="100" cy="138" r="14" fill="#C8916B" />
      <path d="M88,148 L84,174 L116,174 L112,148 Q106,154 100,154 Q94,154 88,148Z" fill="url(#robe-a)" />

      {/* Singer 2 (center) */}
      <circle cx="180" cy="132" r="16" fill="#7B4A2D" />
      <ellipse cx="180" cy="118" rx="14" ry="8" fill="#1A0A00" />
      <path d="M166,146 L160,174 L200,174 L194,146 Q188,152 180,152 Q172,152 166,146Z" fill="#18005F" />

      {/* Singer 3 */}
      <circle cx="260" cy="138" r="14" fill="#E8C49A" />
      <path d="M248,148 L244,174 L276,174 L272,148 Q266,154 260,154 Q254,154 248,148Z" fill="url(#robe-b)" />

      {/* Sheet music each holds */}
      <rect x="112" y="152" width="18" height="22" rx="2" fill="rgba(255,255,255,0.85)" />
      <rect x="192" y="148" width="18" height="22" rx="2" fill="rgba(255,255,255,0.85)" />
      <rect x="272" y="152" width="18" height="22" rx="2" fill="rgba(255,255,255,0.85)" />
    </svg>
  )
}

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

  // Scroll-triggered sections
  const problemSolution = useInView()
  const features = useInView()
  const whoItsFor = useInView()
  const signupSection = useInView()
  const rehearsalBanner = useInView()

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
      <section className="bg-featured-song-gradient text-white px-4 py-16 sm:py-20 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          {/* Two-column on lg+, stacked on mobile */}
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* Text side */}
            <div className="flex-1 flex flex-col items-center lg:items-start gap-6 text-center lg:text-left">
              <div
                className="flex items-center gap-2 bg-white/10 rounded-pill px-4 py-1.5 text-xs font-semibold uppercase tracking-widest animate-fade-in-up"
                style={{ animationDelay: '0ms' }}
              >
                <Mic2 size={12} />
                Early access
              </div>
              <h1
                className="text-4xl sm:text-5xl font-black italic tracking-tight leading-tight animate-fade-in-up"
                style={{ animationDelay: '100ms' }}
              >
                Vocal excellence,<br />coordinated.
              </h1>
              <p
                className="text-base sm:text-lg text-white/80 max-w-md leading-relaxed animate-fade-in-up"
                style={{ animationDelay: '200ms' }}
              >
                Harmoniq is the all-in-one operating system for worship choirs — set lists,
                availability, song library, and announcements in one calm app.
              </p>
              {signupCount !== null && signupCount > 0 && (
                <p
                  className="text-sm text-white/60 animate-fade-in-up"
                  style={{ animationDelay: '280ms' }}
                >
                  <span className="text-white font-semibold">{signupCount.toLocaleString()}</span> choirs already waiting
                </p>
              )}
              <a
                href="#signup"
                className={cn(
                  'inline-flex items-center gap-2 bg-white text-harmonic-primary',
                  'font-semibold px-8 py-3 rounded-pill hover:opacity-90 transition-opacity',
                  'text-sm mt-2 animate-fade-in-up',
                )}
                style={{ animationDelay: '320ms' }}
              >
                Get early access <ArrowRight size={16} />
              </a>
            </div>

            {/* Illustration side */}
            <div
              className="flex-shrink-0 w-full max-w-xs sm:max-w-sm lg:max-w-md animate-fade-in-up"
              style={{ animationDelay: '180ms' }}
              aria-hidden="true"
            >
              {/* Glow card behind illustration */}
              <div className="relative">
                <div className="absolute inset-0 rounded-card-lg bg-white/5 blur-xl" />
                <div className="relative rounded-card-lg bg-white/8 border border-white/15 p-4 backdrop-blur-sm">
                  <ChoirHeroIllustration className="w-full" />
                  {/* Caption bar */}
                  <div className="flex items-center justify-center gap-2 mt-2 pb-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                    <span className="text-white/50 text-xs font-medium tracking-wide">
                      Worship choir rehearsal
                    </span>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/50" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Signup form ── */}
      <section id="signup" className="py-16 px-4 bg-featured-song-gradient">
        <div ref={signupSection.ref} className="max-w-md mx-auto">
          <p
            className={cn(
              'text-white/70 text-xs font-semibold uppercase tracking-widest text-center mb-3',
              'transition-all duration-700 ease-out',
              signupSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
            )}
          >
            Early access
          </p>
          <h2
            className={cn(
              'text-2xl sm:text-3xl font-bold text-white text-center mb-2 tracking-tight',
              'transition-all duration-700 ease-out',
              signupSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
            )}
            style={{ transitionDelay: signupSection.inView ? '100ms' : '0ms' }}
          >
            Be first to know
          </h2>
          <p
            className={cn(
              'text-white/70 text-sm text-center mb-8',
              'transition-all duration-700 ease-out',
              signupSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
            )}
            style={{ transitionDelay: signupSection.inView ? '180ms' : '0ms' }}
          >
            We're opening up choir by choir. Drop your email and we'll reach out when it's your turn.
          </p>

          {submitted ? (
            <div className="bg-white/10 rounded-card-lg p-8 text-center flex flex-col items-center gap-4 animate-scale-in">
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
            <form
              onSubmit={handleSubmit}
              noValidate
              className={cn(
                'flex flex-col gap-4',
                'transition-all duration-700 ease-out',
                signupSection.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
              )}
              style={{ transitionDelay: signupSection.inView ? '260ms' : '0ms' }}
            >
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

      {/* ── Problem / Solution ── */}
      <section className="py-16 px-4">
        <div ref={problemSolution.ref} className="max-w-4xl mx-auto">
          <h2
            className={cn(
              'text-2xl sm:text-3xl font-bold text-harmonic-text text-center mb-12 tracking-tight',
              'transition-all duration-700 ease-out',
              problemSolution.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
            )}
          >
            Choir coordination is broken.<br />We fixed it.
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Problems */}
            <div
              className={cn(
                'bg-white rounded-card border border-harmonic-border p-6 shadow-card',
                'transition-all duration-700 ease-out',
                problemSolution.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
              )}
              style={{ transitionDelay: problemSolution.inView ? '100ms' : '0ms' }}
            >
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
            <div
              className={cn(
                'bg-white rounded-card border border-harmonic-border p-6 shadow-card',
                'transition-all duration-700 ease-out',
                problemSolution.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
              )}
              style={{ transitionDelay: problemSolution.inView ? '220ms' : '0ms' }}
            >
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

      {/* ── Rehearsal illustration banner ── */}
      <section className="px-4 pb-10">
        <div ref={rehearsalBanner.ref} className="max-w-4xl mx-auto">
          <div
            className={cn(
              'rounded-card-lg border border-harmonic-border overflow-hidden shadow-card',
              'transition-all duration-700 ease-out',
              rehearsalBanner.inView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-[0.98]',
            )}
          >
            {/* Illustration fills the card */}
            <RehearsalIllustration className="w-full" />
            {/* Overlay label */}
            <div className="bg-white px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-harmonic-muted mb-0.5">
                  Built for the rehearsal room
                </p>
                <p className="text-sm text-harmonic-text font-medium">
                  Every practice, every service, every voice — coordinated.
                </p>
              </div>
              <a
                href="#signup"
                className="text-xs font-semibold text-harmonic-primary flex items-center gap-1 hover:opacity-75 transition-opacity whitespace-nowrap"
              >
                Get access <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="py-16 px-4 bg-white border-y border-harmonic-border">
        <div ref={features.ref} className="max-w-4xl mx-auto">
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-widest text-harmonic-muted text-center mb-3',
              'transition-all duration-600 ease-out',
              features.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
            )}
          >
            What's inside
          </p>
          <h2
            className={cn(
              'text-2xl sm:text-3xl font-bold text-harmonic-text text-center mb-10 tracking-tight',
              'transition-all duration-700 ease-out',
              features.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
            )}
            style={{ transitionDelay: features.inView ? '80ms' : '0ms' }}
          >
            Everything your choir needs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                className={cn(
                  'rounded-card border border-harmonic-border overflow-hidden hover:shadow-card-hover transition-shadow',
                  'transition-all duration-700 ease-out',
                  features.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
                )}
                style={{ transitionDelay: features.inView ? `${160 + i * 100}ms` : '0ms' }}
              >
                {/* Illustrated header strip */}
                <FeatureCardVisual index={i} />
                {/* Card body */}
                <div className="flex items-start gap-4 p-5 bg-white">
                  <div className="w-10 h-10 rounded-card bg-featured-song-gradient-light flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-harmonic-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-harmonic-text text-sm mb-1">{title}</p>
                    <p className="text-xs text-harmonic-muted leading-relaxed">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section className="py-16 px-4">
        <div ref={whoItsFor.ref} className="max-w-3xl mx-auto text-center">
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-widest text-harmonic-muted mb-3',
              'transition-all duration-600 ease-out',
              whoItsFor.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
            )}
          >
            Built for
          </p>
          <h2
            className={cn(
              'text-2xl sm:text-3xl font-bold text-harmonic-text mb-8 tracking-tight',
              'transition-all duration-700 ease-out',
              whoItsFor.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
            )}
            style={{ transitionDelay: whoItsFor.inView ? '80ms' : '0ms' }}
          >
            Directors and vocalists, both
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Director card */}
            <div
              className={cn(
                'bg-white rounded-card border border-harmonic-border shadow-card overflow-hidden text-left',
                'transition-all duration-700 ease-out',
                whoItsFor.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
              )}
              style={{ transitionDelay: whoItsFor.inView ? '160ms' : '0ms' }}
            >
              {/* Illustration header */}
              <div className="bg-featured-song-gradient-light flex items-center justify-center py-6 px-4">
                <DirectorIllustration className="w-28 h-28" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-card bg-featured-song-gradient-light flex items-center justify-center">
                    <Users size={16} className="text-harmonic-primary" />
                  </div>
                  <p className="font-semibold text-harmonic-text">Directors</p>
                </div>
                <p className="text-sm text-harmonic-muted leading-relaxed">
                  Build set lists, track who's available, broadcast announcements, and manage your
                  whole choir from one screen.
                </p>
              </div>
            </div>

            {/* Vocalist card */}
            <div
              className={cn(
                'bg-white rounded-card border border-harmonic-border shadow-card overflow-hidden text-left',
                'transition-all duration-700 ease-out',
                whoItsFor.inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
              )}
              style={{ transitionDelay: whoItsFor.inView ? '280ms' : '0ms' }}
            >
              {/* Illustration header */}
              <div className="bg-featured-song-gradient-light flex items-center justify-center py-6 px-4">
                <VocalistIllustration className="w-28 h-28" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-card bg-featured-song-gradient-light flex items-center justify-center">
                    <Mic2 size={16} className="text-harmonic-primary" />
                  </div>
                  <p className="font-semibold text-harmonic-text">Vocalists &amp; Musicians</p>
                </div>
                <p className="text-sm text-harmonic-muted leading-relaxed">
                  See what's next, confirm your availability, and access the full song library with
                  keys and lyrics — all in one calm view.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-harmonic-neutral text-white/60 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span className="font-black italic text-white text-base tracking-tight">Harmoniq</span>
          <p>Vocal excellence, coordinated.</p>
          <p>© {new Date().getFullYear()} Harmoniq. All rights reserved.</p>
        </div>
        <div className="max-w-5xl mx-auto mt-6 pt-4 border-t border-white/10 flex justify-center">
          <Link
            to="/sign-in"
            className="text-white/25 text-xs hover:text-white/40 transition-colors"
          >
            Team login
          </Link>
        </div>
      </footer>
    </div>
  )
}

// ─── Feature card visual strips ───────────────────────────────────────────────
// Each returns a small illustrated SVG header for its feature card.

function FeatureCardVisual({ index }: { index: number }) {
  const visuals = [SetListVisual, AvailabilityVisual, SongLibraryVisual, AnnouncementsVisual]
  const Visual = visuals[index % visuals.length]
  return <Visual />
}

function SetListVisual() {
  return (
    <svg viewBox="0 0 320 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full">
      <rect width="320" height="100" fill="url(#sl-bg)" />
      <defs>
        <linearGradient id="sl-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#18005F" stopOpacity="0.07" />
          <stop offset="100%" stopColor="#560056" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      {/* Staff lines */}
      {[28, 38, 48, 58, 68].map((y, i) => (
        <line key={i} x1="20" y1={y} x2="300" y2={y} stroke="rgba(24,0,95,0.12)" strokeWidth="1" />
      ))}
      {/* Notes on staff */}
      <ellipse cx="60"  cy="63" rx="7" ry="5" fill="#18005F" fillOpacity="0.55" transform="rotate(-12 60 63)" />
      <line x1="67" y1="61" x2="67" y2="33" stroke="#18005F" strokeOpacity="0.55" strokeWidth="2" />
      <path d="M67,33 Q80,28 80,38" stroke="#18005F" strokeOpacity="0.55" strokeWidth="2" fill="none" />

      <ellipse cx="110" cy="53" rx="7" ry="5" fill="#560056" fillOpacity="0.55" transform="rotate(-12 110 53)" />
      <line x1="117" y1="51" x2="117" y2="23" stroke="#560056" strokeOpacity="0.55" strokeWidth="2" />
      <path d="M117,23 Q130,18 130,28" stroke="#560056" strokeOpacity="0.55" strokeWidth="2" fill="none" />

      <ellipse cx="155" cy="68" rx="7" ry="5" fill="none" stroke="#18005F" strokeOpacity="0.5" strokeWidth="2" transform="rotate(-12 155 68)" />
      <line x1="162" y1="66" x2="162" y2="38" stroke="#18005F" strokeOpacity="0.5" strokeWidth="2" />

      <ellipse cx="200" cy="48" rx="7" ry="5" fill="#18005F" fillOpacity="0.45" transform="rotate(-12 200 48)" />
      <ellipse cx="220" cy="43" rx="7" ry="5" fill="#18005F" fillOpacity="0.45" transform="rotate(-12 220 43)" />
      <line x1="207" y1="46" x2="207" y2="18" stroke="#18005F" strokeOpacity="0.45" strokeWidth="2" />
      <line x1="227" y1="41" x2="227" y2="13" stroke="#18005F" strokeOpacity="0.45" strokeWidth="2" />
      <line x1="207" y1="18" x2="227" y2="13" stroke="#18005F" strokeOpacity="0.45" strokeWidth="3" />

      {/* Key badge */}
      <rect x="256" y="34" width="30" height="18" rx="9" fill="#18005F" fillOpacity="0.8" />
      <text x="271" y="47" textAnchor="middle" fill="white" fontSize="9" fontFamily="sans-serif" fontWeight="700">Bb</text>
    </svg>
  )
}

function AvailabilityVisual() {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const statuses = ['available', 'available', 'unavailable', 'available', 'maybe', 'available', 'unavailable']
  const colorMap: Record<string, string> = {
    available: '#2E7D5B',
    unavailable: '#E5342B',
    maybe: '#B8860B',
  }
  const bgMap: Record<string, string> = {
    available: '#E6F4ED',
    unavailable: '#FDECEA',
    maybe: '#FEF9E7',
  }
  return (
    <svg viewBox="0 0 320 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full">
      <defs>
        <linearGradient id="av-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#18005F" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#560056" stopOpacity="0.10" />
        </linearGradient>
      </defs>
      <rect width="320" height="100" fill="url(#av-bg)" />
      {/* Calendar header */}
      <rect x="20" y="14" width="280" height="16" rx="4" fill="rgba(24,0,95,0.08)" />
      <text x="160" y="26" textAnchor="middle" fill="#18005F" fillOpacity="0.7" fontSize="9" fontFamily="sans-serif" fontWeight="600">JUNE 2026</text>
      {/* Day cells */}
      {days.map((day, i) => {
        const x = 20 + i * 40 + 4
        const status = statuses[i]
        return (
          <g key={i}>
            <rect x={x} y="36" width="32" height="48" rx="6" fill={bgMap[status]} />
            <text x={x + 16} y="52" textAnchor="middle" fill={colorMap[status]} fontSize="9" fontFamily="sans-serif" fontWeight="600">{day}</text>
            {/* Status dot */}
            <circle cx={x + 16} cy="70" r="7" fill={colorMap[status]} fillOpacity="0.2" />
            <circle cx={x + 16} cy="70" r="4" fill={colorMap[status]} />
          </g>
        )
      })}
    </svg>
  )
}

function SongLibraryVisual() {
  const songs = [
    { title: 'Way Maker', key: 'G', artist: 'Sinach' },
    { title: 'Goodness of God', key: 'C', artist: 'Bethel Music' },
    { title: 'What a Beautiful Name', key: 'D', artist: 'Hillsong' },
  ]
  return (
    <svg viewBox="0 0 320 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full">
      <defs>
        <linearGradient id="sl2-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#18005F" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#560056" stopOpacity="0.11" />
        </linearGradient>
      </defs>
      <rect width="320" height="100" fill="url(#sl2-bg)" />
      {/* Search bar */}
      <rect x="20" y="12" width="280" height="18" rx="9" fill="rgba(255,255,255,0.7)" stroke="rgba(24,0,95,0.12)" strokeWidth="1" />
      <circle cx="35" cy="21" r="5" fill="none" stroke="rgba(24,0,95,0.3)" strokeWidth="1.5" />
      <line x1="39" y1="25" x2="43" y2="29" stroke="rgba(24,0,95,0.3)" strokeWidth="1.5" strokeLinecap="round" />
      <text x="52" y="25" fill="rgba(24,0,95,0.35)" fontSize="8" fontFamily="sans-serif">Search songs…</text>
      {/* Song rows */}
      {songs.map((song, i) => {
        const y = 38 + i * 20
        return (
          <g key={i}>
            <rect x="20" y={y} width="280" height="16" rx="4" fill="rgba(255,255,255,0.6)" />
            <circle cx="32" cy={y + 8} r="5" fill="rgba(24,0,95,0.12)" />
            <text x="45" y={y + 11} fill="rgba(12,12,16,0.8)" fontSize="8" fontFamily="sans-serif" fontWeight="600">{song.title}</text>
            <text x="45" y={y + 19} fill="rgba(12,12,16,0.4)" fontSize="6.5" fontFamily="sans-serif">{song.artist}</text>
            {/* Key badge */}
            <rect x="270" y={y + 3} width="22" height="10" rx="5" fill="#18005F" fillOpacity="0.75" />
            <text x="281" y={y + 11} textAnchor="middle" fill="white" fontSize="7" fontFamily="sans-serif" fontWeight="700">{song.key}</text>
          </g>
        )
      })}
    </svg>
  )
}

function AnnouncementsVisual() {
  return (
    <svg viewBox="0 0 320 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full">
      <defs>
        <linearGradient id="ann-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#18005F" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#560056" stopOpacity="0.10" />
        </linearGradient>
      </defs>
      <rect width="320" height="100" fill="url(#ann-bg)" />
      {/* Announcement cards */}
      {/* Card 1 */}
      <rect x="20" y="12" width="280" height="28" rx="6" fill="rgba(255,255,255,0.75)" stroke="rgba(24,0,95,0.1)" strokeWidth="1" />
      <circle cx="34" cy="26" r="8" fill="#18005F" fillOpacity="0.15" />
      <circle cx="34" cy="26" r="5" fill="#18005F" fillOpacity="0.4" />
      <rect x="48" y="17" width="100" height="6" rx="3" fill="rgba(24,0,95,0.3)" />
      <rect x="48" y="27" width="150" height="5" rx="2.5" fill="rgba(24,0,95,0.14)" />
      <text x="286" y="29" textAnchor="end" fill="rgba(24,0,95,0.3)" fontSize="6.5" fontFamily="sans-serif">2h ago</text>

      {/* Card 2 */}
      <rect x="20" y="46" width="280" height="28" rx="6" fill="rgba(255,255,255,0.6)" stroke="rgba(24,0,95,0.08)" strokeWidth="1" />
      <circle cx="34" cy="60" r="8" fill="#560056" fillOpacity="0.12" />
      <circle cx="34" cy="60" r="5" fill="#560056" fillOpacity="0.35" />
      <rect x="48" y="51" width="80" height="6" rx="3" fill="rgba(24,0,95,0.2)" />
      <rect x="48" y="61" width="120" height="5" rx="2.5" fill="rgba(24,0,95,0.1)" />
      <text x="286" y="63" textAnchor="end" fill="rgba(24,0,95,0.25)" fontSize="6.5" fontFamily="sans-serif">1d ago</text>

      {/* Card 3 - faded */}
      <rect x="20" y="80" width="280" height="16" rx="6" fill="rgba(255,255,255,0.35)" />
      <rect x="48" y="86" width="60" height="4" rx="2" fill="rgba(24,0,95,0.1)" />
    </svg>
  )
}
