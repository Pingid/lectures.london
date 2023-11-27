/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,ts,tsx}', './www/**/*.{ts,tsx,astro}'],
  darkMode: 'media',
  theme: {
    extend: {
      screens: {
        sm: '480px',
        md: '800px',
        lg: '1024px',
        xl: '1280px',
      },
      fontSize: {
        sm: 'var(--text-sm)',
        base: 'var(--text-1)',
        lg: 'var(--text-2)',
        xl: 'var(--text-3)',
        '2xl': 'var(--text-4)',
        '3xl': 'var(--text-5)',
        '4xl': 'var(--text-6)',
      },
      colors: {
        bg: 'var(--bg-color)',
        fg: 'var(--fg-color)',
        fg2: 'var(--fg2-color)',
      },
    },
  },
  variants: {},
  plugins: [require('@tailwindcss/typography')],
}
