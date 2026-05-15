/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Syne"', 'sans-serif'],
      },
      colors: {
        surface: {
          50:  '#f8f8f6',
          100: '#f0efe9',
          200: '#e2e0d8',
          300: '#c8c5b8',
          400: '#b0ada0',
          500: '#6b6860',   /* added — used in btn-outline hover */
          600: '#4a4940',   /* added */
          700: '#2a2920',   /* added — used in card-hover, .input border */
          800: '#1c1b18',
          900: '#111109',
          950: '#0a0a07',
        },
        ink: {
          DEFAULT: '#1c1b18',
          muted:   '#6b6960',
          subtle:  '#9e9b92',
        },
        accent: {
          DEFAULT: '#d4a843',
          light:   '#e8c878',
          dark:    '#a8832e',
        },
        status: {
          ready:      '#4ade80',
          processing: '#facc15',
          failed:     '#f87171',
          uploading:  '#60a5fa',
        },
      },
      animation: {
        'fade-in':        'fadeIn 0.4s ease forwards',
        'slide-up':       'slideUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'slide-in-right': 'slideInRight 0.35s cubic-bezier(0.16,1,0.3,1) forwards',
        'pulse-slow':     'pulse 3s ease-in-out infinite',
        'spin-slow':      'spin 2s linear infinite',
        'thinking':       'thinking 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:       { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:      { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideInRight: { from: { opacity: 0, transform: 'translateX(20px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        thinking:     { '0%,100%': { opacity: 0.3 }, '50%': { opacity: 1 } },
      },
      boxShadow: {
        'card':    '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
        'card-md': '0 2px 8px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)',
        'glow':    '0 0 24px rgba(212,168,67,0.2)',
      },
    },
  },
  plugins: [],
}
