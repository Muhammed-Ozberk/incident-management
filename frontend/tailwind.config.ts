import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        soft: '0 16px 50px rgba(15, 23, 42, 0.08)',
      },
      keyframes: {
        'row-in': {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRow: {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(59, 130, 246, 0.10)' },
        },
      },
      animation: {
        'row-in': 'row-in 220ms ease-out both',
        'pulse-row': 'pulseRow 1200ms ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;

