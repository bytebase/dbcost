/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./layouts/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        // equivalent to grid-cols-[auto,auto,auto,auto,auto,auto,auto]
        "7-auto": "repeat(7, auto)",
      },
    },
  },
  plugins: [],
};
