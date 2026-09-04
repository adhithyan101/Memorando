/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Golden Memories Palette Design Tokens
        bg: {
          light: '#FFF8F2', // Warm Ivory
          dark: '#161412',  // Dark Ivory
        },
        card: {
          light: '#FFFDF9', // Soft Cream
          dark: '#211E1B',  // Dark Cream
        },
        terracotta: {
          DEFAULT: '#D97757',
          hover: '#C56546',
          light: '#F5E4DE',
        },
        sage: {
          DEFAULT: '#A8C3A0',
          hover: '#95B38D',
          light: '#EDF3EC',
        },
        peach: {
          DEFAULT: '#F4B8A8',
          light: '#FDF0EC',
        },
        gold: {
          DEFAULT: '#E7C57B',
          light: '#FAF3E5',
        },
        charcoal: {
          DEFAULT: '#3B3B3B',
          dark: '#F0EDED',
        },
        slate: {
          DEFAULT: '#6E6E6E',
          dark: '#A3A09B',
        },
        sand: {
          DEFAULT: '#ECE4DA',
          dark: '#38332E',
        },
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'Manrope', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(59, 59, 59, 0.05)',
        'warm': '0 10px 30px -4px rgba(217, 119, 87, 0.08)',
        'card': '0 2px 12px -1px rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
