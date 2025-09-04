/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light Theme
        "light-primary": "#6750A4",
        "light-on-primary": "#FFFFFF",
        "light-primary-container": "#EADDFF",
        "light-on-primary-container": "#21005D",
        "light-surface": "#FFFBFE",
        "light-on-surface": "#1C1B1F",
        "light-surface-variant": "#E7E0EC",
        "light-on-surface-variant": "#49454F",
        "light-outline": "#79747E",
        "light-accent": "#625B71", // Kept for consistency if needed, but primary is preferred

        // Dark Theme
        "dark-primary": "#D0BCFF",
        "dark-on-primary": "#381E72",
        "dark-primary-container": "#4F378B",
        "dark-on-primary-container": "#EADDFF",
        "dark-surface": "#1C1B1F",
        "dark-on-surface": "#E6E1E5",
        "dark-surface-variant": "#49454F",
        "dark-on-surface-variant": "#CAC4D0",
        "dark-outline": "#938F99",
        "dark-accent": "#CCC2DC", // Kept for consistency
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
