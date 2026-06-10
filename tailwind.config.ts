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
      },
      colors: {
        harmonic: {
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
        },
      },
      borderRadius: {
        pill: '9999px',
        card: '16px',
        'card-lg': '24px',
      },
      boxShadow: {
        card:        '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover':'0 2px 4px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)',
        glass:       '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)',
        pop:         '0 4px 12px rgba(0,0,0,0.08), 0 16px 48px rgba(0,0,0,0.12)',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.32, 0.72, 0, 1)',
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
      },
      animation: {
        'fade-in':        'fade-in 0.2s ease-out both',
        'slide-up':       'slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in':       'scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
        'bubble-in':      'bubble-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
        'typing-dot':     'typing-dot 1.2s ease-in-out infinite',
        shimmer:          'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
