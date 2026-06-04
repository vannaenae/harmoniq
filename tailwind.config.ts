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
      borderRadius: {
        pill: '9999px',
        card: '16px',
        'card-lg': '24px',
      },
      boxShadow: {
        card: '0 2px 12px 0 rgba(12, 12, 16, 0.06)',
        'card-hover': '0 4px 20px 0 rgba(12, 12, 16, 0.10)',
      },
      backgroundImage: {
        'featured-song-gradient': 'linear-gradient(135deg, theme(\'colors.harmonic.primary\') 0%, theme(\'colors.harmonic.secondary\') 100%)',
        'featured-song-gradient-light': 'linear-gradient(135deg, #18005F15, #56005615)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.90)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}

export default config
