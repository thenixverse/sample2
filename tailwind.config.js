/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#080808', 900: '#080808', 800: '#111111', 700: '#181818', 600: '#202020', 500: '#2A2A2A', 400: '#3A3A3A' },
        blood: {
          50: '#FDECEE', 100: '#FAD0D4', 200: '#F4A1A9', 300: '#EE717E', 400: '#E84A5A',
          500: '#E32636', 600: '#C21D2C', 700: '#9C1723', 800: '#76111A', 900: '#4F0B12',
        },
        gold: { 300: '#D6C39A', 400: '#C7AF7E', 500: '#B89B62', 600: '#9A804C', 700: '#7A653B' },
        muted: '#A1A1AA',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { widest2: '0.3em' },
      keyframes: {
        scrollcue: { '0%': { transform: 'translateY(0)', opacity: '0' }, '30%': { opacity: '1' }, '100%': { transform: 'translateY(14px)', opacity: '0' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
      animation: { scrollcue: 'scrollcue 1.8s ease-in-out infinite', marquee: 'marquee 40s linear infinite' },
    },
  },
  plugins: [],
};
