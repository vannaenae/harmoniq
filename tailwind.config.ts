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
      },
      colors: {
        harmonic: {
          primary:    '#7C3AED',
          secondary:  '#F43F5E',
          accent:     '#0EA5E9',
          neutral:    '#1E1B4B',
          surface:    '#F5F3FF',
          background: '#FAF8FF',
          text:       '#1E1B4B',
          muted:      '#7C7CA8',
          border:     '#EDE9FE',
          success:    '#10B981',
          warning:    '#F59E0B',
          danger:     '#EF4444',
        },
      },
      borderRadius: {
        pill: '9999px',
        card: '16px',
        'card-lg': '24px',
      },
      boxShadow: {
        card:        '0 4px 24px 0 rgba(124, 58, 237, 0.08)',
        'card-hover':'0 8px 40px 0 rgba(124, 58, 237, 0.18)',
        glass:       '0 8px 32px 0 rgba(124, 58, 237, 0.10), inset 0 1px 0 rgba(255,255,255,0.6)',
        glow:        '0 0 32px 0 rgba(124, 58, 237, 0.25)',
      },
    },
  },
  plugins: [],
}

export default config
