import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
        crimson: ['Crimson Pro', 'serif'],
      },
      colors: {
        harmonic: {
          // Core brand — deep purple foundation
          primary:    '#18005F',
          secondary:  '#560056',
          tertiary:   '#37005B',
          // Vivid electric accents
          electric:   '#4F46E5',
          neon:       '#A855F7',
          hot:        '#EC4899',
          amber:      '#F59E0B',
          teal:       '#14B8A6',
          // Neutrals
          neutral:    '#0C0C10',
          void:       '#06020E',
          // Surfaces
          surface:    '#EDE8F6',
          surfaceMid: '#E2D9F5',
          background: '#F0EBFA',
          sidebarBg:  '#07030F',
          sidebarAlt: '#0F0825',
          // Text
          text:       '#0C0C10',
          muted:      '#6B6770',
          onDark:     '#E8E0F4',
          onDarkMuted:'#9B8FBC',
          // Borders
          border:     '#D5CDE8',
          borderDark: '#2A1A4A',
          // Semantic
          success:    '#059669',
          successBg:  '#D1FAE5',
          warning:    '#D97706',
          warningBg:  '#FEF3C7',
          danger:     '#DC2626',
          dangerBg:   '#FEE2E2',
          // Special (legacy compat)
          magenta:    '#C026D3',
          violet:     '#7C3AED',
          indigo:     '#4338CA',
          pink:       '#EC4899',
        },
      },
      backgroundImage: {
        // Core brand gradients
        'gradient-brand':         'linear-gradient(135deg, #18005F 0%, #560056 100%)',
        'gradient-brand-vivid':   'linear-gradient(135deg, #3D1DB5 0%, #913d8c 100%)',
        // Electric spectrum
        'gradient-electric':      'linear-gradient(135deg, #4F46E5 0%, #A855F7 100%)',
        'gradient-neon':          'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
        'gradient-hot':           'linear-gradient(135deg, #EC4899 0%, #F59E0B 80%)',
        'gradient-teal':          'linear-gradient(135deg, #14B8A6 0%, #4F46E5 100%)',
        'gradient-aurora':        'linear-gradient(135deg, #4338CA 0%, #7C3AED 40%, #EC4899 100%)',
        // Hero / screen backgrounds
        'gradient-hero':          'linear-gradient(145deg, #0F0020 0%, #2D0080 40%, #560056 100%)',
        'gradient-hero-vivid':    'linear-gradient(145deg, #07030F 0%, #18005F 35%, #A855F7 75%, #EC4899 100%)',
        'gradient-sidebar':       'linear-gradient(180deg, #07030F 0%, #0F0825 100%)',
        'gradient-stage':         'linear-gradient(135deg, #1A0050 0%, #560056 50%, #A21CAF 100%)',
        // Card accents
        'gradient-card-electric': 'linear-gradient(135deg, rgba(79,70,229,0.04), rgba(168,85,247,0.10))',
        'gradient-card-neon':     'linear-gradient(135deg, rgba(236,72,153,0.04), rgba(245,158,11,0.10))',
        'gradient-card-teal':     'linear-gradient(135deg, rgba(20,184,166,0.04), rgba(79,70,229,0.10))',
        'gradient-card-accent':   'linear-gradient(135deg, rgba(24,0,95,0.06), rgba(86,0,86,0.10))',
        // Legacy compat
        'gradient-warm':          'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
        'featured-song-gradient':       'linear-gradient(135deg, #18005F 0%, #560056 100%)',
        'featured-song-gradient-light': 'linear-gradient(135deg, rgba(24,0,95,0.08), rgba(86,0,86,0.12))',
      },
      borderRadius: {
        pill:    '9999px',
        card:    '16px',
        'card-lg': '24px',
      },
      boxShadow: {
        card:          '0 2px 12px 0 rgba(12, 12, 16, 0.06)',
        'card-hover':  '0 8px 28px 0 rgba(24, 0, 95, 0.18)',
        'card-glow':   '0 4px 24px 0 rgba(124, 58, 237, 0.30)',
        'card-neon':   '0 4px 32px 0 rgba(168, 85, 247, 0.35)',
        'card-hot':    '0 4px 24px 0 rgba(236, 72, 153, 0.35)',
        'card-amber':  '0 4px 24px 0 rgba(245, 158, 11, 0.30)',
        'btn-glow':    '0 4px 20px 0 rgba(86, 0, 86, 0.45)',
        'btn-electric':'0 4px 20px 0 rgba(79, 70, 229, 0.50)',
        'btn-neon':    '0 4px 20px 0 rgba(168, 85, 247, 0.50)',
        'nav-active':  '0 4px 12px 0 rgba(24, 0, 95, 0.30)',
        'nav-glow':    '0 0 16px rgba(168, 85, 247, 0.60)',
        'sidebar-item':'0 2px 12px 0 rgba(168, 85, 247, 0.25)',
        'inner-glow':  'inset 0 1px 0 rgba(255,255,255,0.08)',
        'neon-border': '0 0 0 1px rgba(168, 85, 247, 0.40), 0 0 16px rgba(168, 85, 247, 0.20)',
      },
      keyframes: {
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%':   { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.88)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        popIn: {
          '0%':   { transform: 'scale(0.8)', opacity: '0' },
          '70%':  { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        navPop: {
          '0%':   { transform: 'scale(0.80)' },
          '55%':  { transform: 'scale(1.10)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(168, 85, 247, 0.4)' },
          '50%':      { boxShadow: '0 0 28px rgba(168, 85, 247, 0.80), 0 0 48px rgba(168, 85, 247, 0.30)' },
        },
        ripple: {
          '0%':   { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        beatPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '15%':      { transform: 'scale(1.08)' },
          '30%':      { transform: 'scale(1)' },
          '45%':      { transform: 'scale(1.05)' },
          '60%':      { transform: 'scale(1)' },
        },
        slideUpBounce: {
          '0%':   { opacity: '0', transform: 'translateY(32px)' },
          '70%':  { opacity: '1', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        waveBar: {
          '0%, 100%': { transform: 'scaleY(0.4)' },
          '50%':      { transform: 'scaleY(1)' },
        },
        auroraShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        neonFlicker: {
          '0%, 100%': { opacity: '1' },
          '92%':      { opacity: '1' },
          '93%':      { opacity: '0.85' },
          '94%':      { opacity: '1' },
          '96%':      { opacity: '0.90' },
          '97%':      { opacity: '1' },
        },
      },
      animation: {
        'fade-in-up':     'fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in-down':   'fadeInDown 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in':        'fadeIn 0.4s ease both',
        'scale-in':       'scaleIn 0.35s cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-in-left':  'slideInLeft 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'shimmer':        'shimmer 2s linear infinite',
        'pop-in':         'popIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
        'nav-pop':        'navPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'gradient-shift': 'gradientShift 6s ease infinite',
        'float':          'float 3s ease-in-out infinite',
        'glow-pulse':     'glowPulse 2.5s ease-in-out infinite',
        'ripple':         'ripple 0.65s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'beat-pulse':     'beatPulse 1.8s ease-in-out infinite',
        'slide-up-bounce':'slideUpBounce 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'wave-bar':       'waveBar 0.9s ease-in-out infinite',
        'aurora-shift':   'auroraShift 10s ease-in-out infinite',
        'neon-flicker':   'neonFlicker 6s linear infinite',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}

export default config
