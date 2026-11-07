/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        festive: {
          gold: '#FFD700',
          amber: '#FF9900',
          saffron: '#FF7700',
          crimson: '#D90429',
          deepNight: '#0B0D1B',
          glow: '#FFAA33'
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'sparkle': 'sparkle 1.5s infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { filter: 'drop-shadow(0 0 12px rgba(255, 170, 51, 0.6))' },
          '50%': { filter: 'drop-shadow(0 0 24px rgba(255, 200, 80, 0.9))' },
        },
        sparkle: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.08)', opacity: '0.85' },
        }
      }
    },
  },
  plugins: [],
}
