/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    // Mute ERROR  Importing directly from a nuxt.config file is not allowed. Instead, use runtime config or a module. [importing /nuxt.config.ts from index.html]
    // "./nuxt.config.{js,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
