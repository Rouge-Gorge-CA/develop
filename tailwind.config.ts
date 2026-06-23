import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        wine: {
          bg: '#0F0E0C',
          card: '#1A1916',
          hover: '#222019',
          text: '#F2EDE4',
          muted: '#A09A90',
          accent: '#C4855A',
          sage: '#6B7C60',
          border: '#2E2C28',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
