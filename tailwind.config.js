/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: { 
        primary: {
          DEFAULT: '#1a7cf7'
        },
        hipatDark: {
          DEFAULT: '#000'
        },
        accent: {
          DEFAULT: '#b45cff'
        }
      },
      borderRadius: {
        DEFAULT: '8px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite'
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 30px #1a7cf7, 0 0 50px #b45cff' },
          '100%': { boxShadow: '0 0 50px #1a7cf7, 0 0 100px #b45cff' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
    },
  },
  plugins: [],
};