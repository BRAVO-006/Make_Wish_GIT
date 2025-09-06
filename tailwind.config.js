/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class', // Enable dark mode
  theme: {
    extend: {
      colors: {
        // Figma Login Page Brand Color
        brand: {
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        // Light Theme (Material You)
        light: {
          primary: 'var(--color-light-primary)',
          'on-primary': 'var(--color-light-on-primary)',
          'primary-container': 'var(--color-light-primary-container)',
          'on-primary-container': 'var(--color-light-on-primary-container)',
          surface: 'var(--color-light-surface)',
          'on-surface': 'var(--color-light-on-surface)',
          'surface-variant': 'var(--color-light-surface-variant)',
          'on-surface-variant': 'var(--color-light-on-surface-variant)',
          outline: 'var(--color-light-outline)',
          'surface-container-low': 'var(--color-light-surface-container-low)',
        },
        // Dark Theme (Material You)
        dark: {
          primary: 'var(--color-dark-primary)',
          'on-primary': 'var(--color-dark-on-primary)',
          'primary-container': 'var(--color-dark-primary-container)',
          'on-primary-container': 'var(--color-dark-on-primary-container)',
          surface: 'var(--color-dark-surface)',
          'on-surface': 'var(--color-dark-on-surface)',
          'surface-variant': 'var(--color-dark-surface-variant)',
          'on-surface-variant': 'var(--color-dark-on-surface-variant)',
          outline: 'var(--color-dark-outline)',
          'surface-container-low': 'var(--color-dark-surface-container-low)',
        },
      },
    },
  },
  plugins: [],
};

