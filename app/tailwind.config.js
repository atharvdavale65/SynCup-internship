/* eslint-disable  @typescript-eslint/no-var-requires */
/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react")

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      backgroundColor: {
        "custom-light": "#fff", // Default
        ".dark custom-dark": "#444", // Dark mode
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      prefix: "nextui",
      addCommonColors: false,
      defaultTheme: "light",
      defaultExtendTheme: "light",
      layout: {}, // common layout  (applied to all themes)
      themes: {
        light: {
          layout: {}, // light theme layout tokens
          colors: {}, // light theme colors
        },
        dark: {
          layout: {},
          colors: {
            background: "#1D1E20", // background color for navbar and sidebar
            100: "#0F1D27",
            200: "#11212E",
            300: "#142636",
            400: "#172A3D",
            500: "#1A2E44",
            600: "#B196F4", // text for buttons
            700: "#a688fa", // buttons
            800: "#323434", // category
            900: "#3f3f3f", // cards
            foreground: "#FFFFFF",
            DEFAULT: "#282828", // colour of body
            text: "#fff", // for text
          },
        },
      },
    }),
  ],
}
