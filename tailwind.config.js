/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        garden: {
          '50': 'hsl(var(--garden-light) / <alpha-value>)',
          '100': 'hsl(150, 40%, 90%)',
          '200': 'hsl(150, 45%, 80%)',
          '300': 'hsl(150, 50%, 70%)',
          '400': 'hsl(150, 55%, 50%)',
          '500': 'hsl(151, 84%, 32%)',
          '600': 'hsl(var(--garden-primary) / <alpha-value>)',
          '700': 'hsl(144, 61%, 20%)',
          '800': 'hsl(146, 57%, 15%)',
          '900': 'hsl(var(--garden-dark) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shine': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shine': 'shine 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}