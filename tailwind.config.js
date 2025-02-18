module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6',
          dark: '#2563EB',
        },
        dark: {
          DEFAULT: '#1F2937',
          lighter: '#374151',
          darker: '#111827',
        },
      },
      backgroundColor: theme => ({
        ...theme('colors'),
        'dark-card': '#1F2937',
        'dark-hover': '#374151',
      }),
      borderColor: theme => ({
        ...theme('colors'),
        'dark-border': '#374151',
      }),
      textColor: theme => ({
        ...theme('colors'),
        'dark-text': '#F9FAFB',
        'dark-text-secondary': '#D1D5DB',
      }),
    },
  },
  plugins: [],
}
