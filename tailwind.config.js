/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MIT Brand Colors
        'mit-red': '#A31F34',
        'mit-red-dark': '#8A1538',
        'mit-red-light': '#C1272D',
        'mit-silver': '#8A8B8C',
        // Enhanced Sustainable Green Palette
        'recycling-green': '#2E7D32',
        'recycling-green-dark': '#1B5E20',
        'recycling-green-light': '#4CAF50',
        'recycling-green-lighter': '#81C784',
        'recycling-green-pale': '#E8F5E9',
        'recycling-green-subtle': '#C8E6C9',
        // Earth Tones
        'earth-brown': '#6D4C41',
        'earth-tan': '#D7CCC8',
        'sky-blue': '#64B5F6',
        'sky-blue-light': '#E3F2FD',
        // Design system colors (from mock)
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}

