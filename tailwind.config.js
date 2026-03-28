/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './src/index.html'
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#111827',
          card: '#1F2937',
          border: '#374151',
          hover: '#283548'
        },
        light: {
          text: '#F9FAFB',
          muted: '#9CA3AF'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 2s linear infinite',
      }
    }
  },
  plugins: []
};