/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        botanical: {
          bg: '#F9F8F4',
          text: '#2D3A31',
          primary: '#8C9A84',
          'primary-dark': '#6B7D63',
          'primary-light': '#A8B5A0',
          secondary: '#DCCFC2',
          border: '#E6E2DA',
          accent: '#C27B66',
          'accent-dark': '#A56651',
          muted: '#9AA394',
          surface: '#F2EFE9',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 2px 20px rgba(45,58,49,0.06)',
        'soft-md': '0 4px 30px rgba(45,58,49,0.10)',
        'soft-lg': '0 8px 40px rgba(45,58,49,0.14)',
        'inner-soft': 'inset 0 2px 8px rgba(45,58,49,0.06)',
      },
      transitionDuration: {
        600: '600ms',
        700: '700ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.7s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'fade-up': 'fadeUp 0.7s ease-out both',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        fadeUp: { from: { opacity: '0', transform: 'translateY(32px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
