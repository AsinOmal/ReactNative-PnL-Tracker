/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - TradeX Green
        primary: {
          DEFAULT: '#10B95F',
          light: '#34D399',
          dark: '#059669',
        },
        // Status colors
        profit: {
          DEFAULT: '#10B95F',
          light: 'rgba(16, 185, 95, 0.1)',
        },
        loss: {
          DEFAULT: '#EF4444',
          light: 'rgba(239, 68, 68, 0.1)',
        },
        // Dark theme
        dark: {
          bg: '#0A0A0A',
          surface: '#18181B',
          card: '#1F1F23',
          border: '#27272A',
          text: '#F4F4F5',
          muted: '#71717A',
        },
        // Light theme
        light: {
          bg: '#FAFAFA',
          surface: '#FFFFFF',
          card: '#F4F4F5',
          border: '#E4E4E7',
          text: '#18181B',
          muted: '#A1A1AA',
        },
      },
      fontFamily: {
        'jakarta': ['PlusJakartaSans-Regular'],
        'jakarta-medium': ['PlusJakartaSans-Medium'],
        'jakarta-semibold': ['PlusJakartaSans-SemiBold'],
        'jakarta-bold': ['PlusJakartaSans-Bold'],
        'jakarta-extrabold': ['PlusJakartaSans-ExtraBold'],
      },
    },
  },
  plugins: [],
};
