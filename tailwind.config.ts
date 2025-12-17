import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#09090b',
          1: '#0a0a0f',
          2: '#0f0f15',
          3: '#14141c',
          4: '#1a1a24',
        },
        border: {
          DEFAULT: '#1e1e2a',
          light: '#2a2a3a',
        },
        whale: '#f59e0b',
        shark: '#a855f7',
        dolphin: '#3b82f6',
        profit: '#34d399',
        loss: '#f87171',
        brand: '#a855f7',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-live': 'pulse-live 2s ease-in-out infinite',
        'glow-gold': 'glow-gold 2.5s ease-in-out infinite',
        'fade-up': 'fade-up 0.4s ease-out forwards',
        'bar-grow': 'bar-grow 0.6s ease-out forwards',
        'btn-glow': 'btn-glow 2.5s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out forwards',
        'shimmer': 'shimmer 3s infinite',
        'spin-slow': 'spin 1s linear infinite',
      },
      keyframes: {
        'pulse-live': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        'glow-gold': {
          '0%, 100%': { boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.6)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'bar-grow': {
          '0%': { width: '0' },
          '100%': { width: 'var(--bar-w)' },
        },
        'btn-glow': {
          '0%, 100%': {
            boxShadow: '0 4px 25px -5px rgba(168, 85, 247, 0.5), 0 0 0 0 rgba(217, 70, 239, 0)',
          },
          '50%': {
            boxShadow: '0 4px 30px -5px rgba(168, 85, 247, 0.7), 0 0 20px 2px rgba(217, 70, 239, 0.15)',
          },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
