import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'av-black': '#000000',
        'av-bg': '#050705',
        'av-bg-2': '#0a0f0a',
        'av-surface': '#0f1410',
        'av-green': '#00ff6a',
        'av-green-dim': '#00cc55',
        'av-green-deep': '#007a33',
        'av-yellow': '#ffb74d',
        'av-yellow-deep': '#b87519',
        'av-muted': '#8b928d',
        'av-line': '#1a241c',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glow-green': '0 0 24px rgba(0, 255, 106, 0.25)',
        'glow-green-lg': '0 0 48px rgba(0, 255, 106, 0.18)',
        'glow-green-sm': '0 0 12px rgba(0, 255, 106, 0.3)',
        'glow-gold': '0 0 24px rgba(201, 169, 97, 0.28)',
        'glow-gold-lg': '0 0 48px rgba(201, 169, 97, 0.2)',
        'glow-gold-sm': '0 0 12px rgba(201, 169, 97, 0.35)',
      },
      backgroundImage: {
        'grid-trading':
          'linear-gradient(rgba(0, 255, 106, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 106, 0.04) 1px, transparent 1px)',
        'radial-glow':
          'radial-gradient(circle at 50% 0%, rgba(0, 255, 106, 0.12) 0%, transparent 60%)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out both',
        'fade-in': 'fadeIn 1s ease-out both',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float-slow': 'floatSlow 8s ease-in-out infinite',
        'beam-sweep': 'beamSweep 7s linear infinite',
        'chart-draw': 'chartDraw 3.2s ease-out forwards',
        'marquee-x': 'marqueeX 30s linear infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.45', filter: 'blur(18px)' },
          '50%': { opacity: '0.85', filter: 'blur(28px)' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        beamSweep: {
          '0%': { transform: 'translateX(-30%) rotate(12deg)', opacity: '0' },
          '20%': { opacity: '0.7' },
          '80%': { opacity: '0.7' },
          '100%': { transform: 'translateX(130%) rotate(12deg)', opacity: '0' },
        },
        chartDraw: {
          '0%': { strokeDashoffset: '2000' },
          '100%': { strokeDashoffset: '0' },
        },
        marqueeX: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
