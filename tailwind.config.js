/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#DC2626',
          dark: '#991B1B',
          light: '#EF4444',
        },
        dark: {
          DEFAULT: '#0A0A0A',
          light: '#1a1a1a',
          lighter: '#262626',
        },
        gray: {
          text: '#737373',
          light: '#D4D4D4',
          bg: '#F5F5F5',
        },
        accent: {
          DEFAULT: '#d4a853',
          dark: '#b8902e',
        },
        neon: {
          blue: '#00D4FF',
          green: '#39FF14',
        },
      },
      fontFamily: {
        sans: ['Work Sans', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
      },
      letterSpacing: {
        wider: '0.05em',
        widest: '0.1em',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
}
