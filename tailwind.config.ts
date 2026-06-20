import type { Config } from 'tailwindcss';

/**
 * Design tokens from PRD.md Section 13 (Design System Spec).
 * Reference: glassmorphic, warm-dark aesthetic, gentle mood-scale colors
 * (cool→warm, never red→green), muted terracotta for safety states (never harsh red).
 */
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-base': '#0E0D0F',
        'bg-card': 'rgba(255,255,255,0.06)',
        'border-glass': 'rgba(255,255,255,0.10)',
        'accent-warm': '#F4A261',
        'accent-cool': '#6B7AA1',
        'accent-danger-soft': '#C97B63',
        'text-primary': '#F5F1EC',
        'text-muted': '#A8A29A',
      },
      backdropBlur: {
        glass: '16px',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'], // greeting line only — see PRD Section 13
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'gentle-pulse': 'gentlePulse 4s ease-in-out infinite',
      },
      keyframes: {
        gentlePulse: {
          '0%, 100%': { opacity: '0.7', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
