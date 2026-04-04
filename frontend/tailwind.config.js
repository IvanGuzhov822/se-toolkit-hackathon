/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        q1: '#ef4444',  // red — urgent + important
        q2: '#3b82f6',  // blue — not urgent + important
        q3: '#f59e0b',  // amber — urgent + not important
        q4: '#6b7280',  // gray — not urgent + not important
      },
    },
  },
  plugins: [],
}
