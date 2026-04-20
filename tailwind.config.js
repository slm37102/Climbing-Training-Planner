/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './{App,index}.{ts,tsx}',
    './{pages,components,context,hooks,data,utils}/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        stone: {
          850: '#1c1917',
          900: '#0c0a09',
        },
        amber: {
          350: '#fbbf24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
