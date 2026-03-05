/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/popup/**/*.{html,tsx,ts}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#7856FF',
          light: '#9B7FFF',
          dark: '#5A3DD6',
        },
        x: {
          bg: {
            light: '#ffffff',
            dark: '#000000',
          },
          text: {
            light: '#0f1419',
            dark: '#e7e9ea',
          },
          secondary: {
            light: '#536471',
            dark: '#71767b',
          },
          border: {
            light: '#eff3f4',
            dark: '#2f3336',
          },
        },
      },
    },
  },
  plugins: [],
};
