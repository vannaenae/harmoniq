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
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'sans-serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
        crimson: ['Crimson Pro', 'serif'],
      },
      colors: {
        harmonic: {
          // Core palette — single indigo accent, iOS system grays
          primary:    '#5E5CE6',
          secondary:  '#FF375F',
          accent:     '#0A84FF',
          neutral:    '#1C1C1E',
          surface:    '#F2F2F7',
          background: '#F5F5F7',
          text:       '#1C1C1E',
          muted:      '#8E8E93',
          border:     '#E5E5EA',
          success:    '#34C759',
          warning:    '#FF9500',
          danger:     '#FF3B30',
          // Extended names kept for existing pages, mapped to the same
          // restrained palette so legacy classes stay coherent
          tertiary:   '#7D7AED',
          electric:   '#5E5CE6',
          neon:       '#7D7AED',
          hot:        '#FF375F',
          amber:      '#FF9500',
          teal:       '#30B0C7',
          void:       '#1C1C1E',
          surfaceMid: '#E5E5EA',
          sidebarBg:  '#FFFFFF',
          sidebarAlt: '#F5F5F7',
          onDark:     '#FFFFFF',
          onDarkMuted:'rgba(255,255,255,0.64)',
          borderDark: '#3A3A3C',
          successBg:  '#E8F8EC',
          warningBg:  '#FFF4E5',
          dangerBg:   '#FFEBEA',
          magenta:    '#FF375F',
          violet:     '#5E5CE6',
          indigo:     '#5E5CE6',
          pink:       '#FF375F',
        },
      },
      backgroundImage: {
        // All gradients resolve to soft indigo-family blends — gradient class
        // names used across pages keep working, with Apple-grade restraint
        'gradient-brand':         'linear-gradient(135deg, #5E5CE6 0%, #7D7AED 100%)',
        'gradient-brand-vivid':   'linear-gradient(135deg, #4B49D6 0%, #7D7AED 100%)',
        'gradient-electric':      'linear-gradient(135deg, #5E5CE6 0%, #0A84FF 100%)',
        'gradient-neon':          'linear-gradient(135deg, #5E5CE6 0%, #8E8CF0 100%)',
        'gradient-hot':           'linear-gradient(135deg, #FF375F 0%, #FF9500 100%)',
        'gradient-teal':          'linear-gradient(135deg, #30B0C7 0%, #0A84FF 100%)',
        'gradient-aurora':        'linear-gradient(135deg, #4B49D6 0%, #5E5CE6 50%, #7D7AED 100%)',
        'gradient-hero':          'linear-gradient(145deg, #1C1C1E 0%, #2E2D5C 60%, #3F3D8A 100%)',
        'gradient-hero-vivid':    'linear-gradient(145deg, #1C1C1E 0%, #34336B 55%, #5E5CE6 100%)',
        'gradient-sidebar':       'linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 100%)',
        'gradient-stage':         'linear-gradient(135deg, #2E2D5C 0%, #4B49D6 100%)',
        'gradient-card-electric': 'linear-gradient(135deg, rgba(94,92,230,0.04), rgba(94,92,230,0.10))',
        'gradient-card-neon':     'linear-gradient(135deg, rgba(94,92,230,0.04), rgba(125,122,237,0.10))',
        'gradient-card-teal':     'linear-gradient(135deg, rgba(48,176,199,0.05), rgba(10,132,255,0.08))',
        'gradient-card-accent':   'linear-gradient(135deg, rgba(94,92,230,0.05), rgba(94,92,230,0.10))',
        'gradient-warm':          'linear-gradient(135deg, #5E5CE6 0%, #FF375F 100%)',
        'featured-song-gradient':       'linear-gradient(135deg, #4B49D6 0%, #5E5CE6 100%)',
        'featured-song-gradient-light': 'linear-gradient(135deg, rgba(94,92,230,0.08), rgba(94,92,230,0.12))',
      },
      borderRadius: {
        pill:    '9999px',
        card:    '16px',
        'card-lg': '24px',
      },
      boxShadow: {
        card:          '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover':  '0 2px 4px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)',
        glass:         '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        pop:           '0 4px 12px rgba(0,0,0,0.08), 0 16px 48px rgba(0,0,0,0.12)',
        // Legacy glow names kept, toned down to soft tinted shadows
        'card-glow':   '0 4px 20px 0 rgba(94, 92, 230, 0.16)',
        'card-neon':   '0 4px 20px 0 rgba(94, 92, 230, 0.16)',
        'card-hot':    '0 4px 20px 0 rgba(255, 55, 95, 0.14)',
        'card-amber':  '0 4px 20px 0 rgba(255, 149, 0, 0.14)',
        'btn-glow':    '0 2px 12px 0 rgba(94, 92, 230, 0.28)',
        'btn-electric':'0 2px 12px 0 rgba(94, 92, 230, 0.28)',
        'btn-neon':    '0 2px 12px 0 rgba(94, 92, 230, 0.28)',
        'nav-active':  '0 2px 10px 0 rgba(94, 92, 230, 0.20)',
        'nav-glow':    '0 0 12px rgba(94, 92, 230, 0.25)',
        'sidebar-item':'0 2px 10px 0 rgba(94, 92, 230, 0.14)',
        'inner-glow':  'inset 0 1px 0 rgba(255,255,255,0.08)',
        'neon-border': '0 0 0 1px rgba(94, 92, 230, 0.30), 0 0 12px rgba(94, 92, 230, 0.12)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.32, 0.72, 0, 1)',
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(28px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'bubble-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.97)' },
          to:   { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'typing-dot': {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%':           { transform: 'translateY(-3px)', opacity: '1' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to:   { backgroundPosition: '-200% 0' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%':   { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        popIn: {
          '0%':   { transform: 'scale(0.92)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        navPop: {
          '0%':   { transform: 'scale(0.92)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(94, 92, 230, 0.18)' },
          '50%':      { boxShadow: '0 0 18px rgba(94, 92, 230, 0.32)' },
        },
        ripple: {
          '0%':   { transform: 'scale(0)', opacity: '0.4' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        beatPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '15%':      { transform: 'scale(1.04)' },
          '30%':      { transform: 'scale(1)' },
        },
        slideUpBounce: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
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
      },
      animation: {
        'fade-in':        'fade-in 0.2s ease-out both',
        'slide-up':       'slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in':       'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'bubble-in':      'bubble-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
        'typing-dot':     'typing-dot 1.2s ease-in-out infinite',
        shimmer:          'shimmer 2s linear infinite',
        'fade-in-up':     'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in-down':   'fadeInDown 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-left':  'slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pop-in':         'popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
        'nav-pop':        'navPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'float':          'float 4s ease-in-out infinite',
        'glow-pulse':     'glowPulse 3s ease-in-out infinite',
        'ripple':         'ripple 0.65s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'beat-pulse':     'beatPulse 2s ease-in-out infinite',
        'slide-up-bounce':'slideUpBounce 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'wave-bar':       'waveBar 0.9s ease-in-out infinite',
        'aurora-shift':   'auroraShift 12s ease-in-out infinite',
        'neon-flicker':   'fade-in 0.2s ease-out both',
      },
    },
  },
  plugins: [],
}

export default config
