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
          primary:    '#18005F',
          secondary:  '#560056',
          tertiary:   '#37005B',
          violet:     '#7C3AED',
          magenta:    '#C026D3',
          pink:       '#EC4899',
          indigo:     '#4338CA',
          neutral:    '#0C0C10',
          surface:    '#EDEAEF',
          background: '#F4F2F5',
          text:       '#0C0C10',
          muted:      '#6B6770',
          border:     '#DAD6DD',
          success:    '#2E7D5B',
          warning:    '#B8860B',
          danger:     '#E5342B',
        },
      },
      backgroundImage: {
        'gradient-brand':        'linear-gradient(135deg, #18005F 0%, #560056 100%)',
        'gradient-brand-vivid':  'linear-gradient(135deg, #3D1DB5 0%, #913d8c 100%)',
        'gradient-electric':     'linear-gradient(135deg, #4338CA 0%, #C026D3 100%)',
        'gradient-warm':         'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
        'gradient-hero':         'linear-gradient(135deg, #18005F 0%, #37005B 50%, #560056 100%)',
        'gradient-card-accent':  'linear-gradient(135deg, #18005F15, #56005615)',
        'featured-song-gradient':       'linear-gradient(135deg, #18005F 0%, #560056 100%)',
        'featured-song-gradient-light': 'linear-gradient(135deg, #18005F15, #56005615)',
      },
      borderRadius: {
        pill: '9999px',
        card: '16px',
        'card-lg': '24px',
      },
      boxShadow: {
        card:         '0 2px 12px 0 rgba(12, 12, 16, 0.06)',
        'card-hover': '0 8px 28px 0 rgba(24, 0, 95, 0.18)',
        'card-glow':  '0 4px 24px 0 rgba(124, 58, 237, 0.25)',
        'btn-glow':   '0 4px 20px 0 rgba(86, 0, 86, 0.40)',
        'nav-active': '0 4px 12px 0 rgba(24, 0, 95, 0.30)',
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
          '0%':   { opacity: '0', transform: 'scale(0.90)' },
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
          '70%':  { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        navPop: {
          '0%':   { transform: 'scale(0.85)' },
          '60%':  { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-6px)' },
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
        'gradient-shift': 'gradientShift 4s ease infinite',
        'float':          'float 3s ease-in-out infinite',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}

export default config
