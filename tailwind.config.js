/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        garden: {
          50: 'var(--garden-50)',
          100: 'var(--garden-100)',
          200: 'var(--garden-200)',
          300: 'var(--garden-300)',
          400: 'var(--garden-400)',
          500: 'var(--garden-500)',
          600: 'var(--garden-600)',
          700: 'var(--garden-700)',
          800: 'var(--garden-800)',
          900: 'var(--garden-900)',
          950: 'var(--garden-950)',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'wave': 'wave 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        wave: {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-5px)' },
          '100%': { transform: 'translateX(0)' }
        }
      },
      backgroundImage: {
        'garden-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.828-1.415 1.415L51.8 0h2.827zM5.373 0l-.83.828L5.96 2.243 8.2 0H5.374zM48.97 0l3.657 3.657-1.414 1.414L46.143 0h2.828zM11.03 0L7.372 3.657 8.787 5.07 13.857 0H11.03zm32.284 0L49.8 6.485 48.384 7.9l-7.9-7.9h2.83zM16.686 0L10.2 6.485 11.616 7.9l7.9-7.9h-2.83zm20.97 0l9.315 9.314-1.414 1.414L34.828 0h2.83zM22.344 0L13.03 9.314l1.414 1.414L25.172 0h-2.83zM32 0l12.142 12.142-1.414 1.414L30 .828 17.272 13.556l-1.414-1.414L28 0h4zM.284 0l28 28-1.414 1.414L0 2.544v2.83L25.456 30l-1.414 1.414-28-28L0 0h.284zM0 5.373l25.456 25.455-1.414 1.415L0 8.2v2.83l21.627 21.628-1.414 1.414L0 13.515v2.83l17.8 17.8-1.415 1.413L0 18.688v2.83l14.97 14.97-1.414 1.415L0 23.857v2.83l12.142 12.14-1.414 1.416L0 29.03v2.828l9.313 9.312-1.414 1.414L0 34.342v2.83l6.485 6.483-1.414 1.415L0 39.626v2.83l3.657 3.656-1.414 1.414L0 44.97v2.83L.828 48.8l1.415-1.415L0 44.97v-2.83l3.657 3.657 1.414-1.415L0 39.626v-2.83l6.485 6.486 1.414-1.414L0 34.343v-2.83l9.313 9.312 1.414-1.414L0 29.03v-2.83l12.142 12.143 1.414-1.414L0 23.858v-2.83l14.97 14.97 1.415-1.414L0 18.686v-2.83L17.8 33.657l1.414-1.414L0 13.516v-2.83L21.626 32.17l1.415-1.414L0 8.2v-2.83L25.456 30.83l1.414-1.414L0 2.544V0h28L0 28l1.414 1.414L30 .828 58.586 29.414 60 28 30 0H0z' fill='%234CAF50' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E\");"
      }
    },
  },
  plugins: [],
};