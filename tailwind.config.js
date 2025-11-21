/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3498db',
        'primary-dark': '#2980b9',
        secondary: '#2c3e50',
        light: '#f8f8f8',
        dark: '#000000',
        white: '#ffffff',
        gray: '#7f8c8d',
        'light-gray': '#bdc3c7',
      },
      boxShadow: {
        sm: '0 2px 4px rgba(0,0,0,0.1)',
        md: '0 4px 8px rgba(0,0,0,0.15)',
        lg: '0 6px 12px rgba(0,0,0,0.2)',
      },
      borderRadius: {
        DEFAULT: '12px',
      },
      transitionProperty: {
        DEFAULT: 'all 0.3s ease',
      },
    },
  },
  plugins: [],
};