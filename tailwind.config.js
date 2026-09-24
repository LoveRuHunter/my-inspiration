/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        holo: {
          void: '#03060f',
          deep: '#060b1c',
          panel: '#0a1330',
          edge: '#1a2554',
          blue: '#3b82f6',
          glow: '#6ea8ff',
          crystal: '#a5c8ff',
          bone: '#e8ecf5',
        },
      },
      fontFamily: {
        display: ['"Orbitron"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        holo: '0 0 24px rgba(110, 168, 255, 0.35), inset 0 0 0 1px rgba(165, 200, 255, 0.15)',
        'holo-strong':
          '0 0 48px rgba(110, 168, 255, 0.55), inset 0 0 0 1px rgba(165, 200, 255, 0.3)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'scan-line': 'scan-line 6s linear infinite',
      },
    },
  },
  plugins: [],
};
