/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./app/*.{js,ts,jsx,tsx}",
    "./components/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      colors: {
        industrial: {
          bg: "#050505",
          panel: "#0a0a0a",
          border: "#27272a",
          accent: "#EAB308", // Safety Yellow
          accentDim: "rgba(234, 179, 8, 0.1)",
          text: "#e5e5e5",
          subtext: "#737373",
        },
      },
      backgroundImage: {
        "grid-pattern": "radial-gradient(circle, #27272a 1px, transparent 1px)",
        "striped-pattern":
          "repeating-linear-gradient(45deg, rgba(39, 39, 42, 0.5), rgba(39, 39, 42, 0.5) 10px, transparent 10px, transparent 20px)",
      },
      animation: {
        blink: "blink 1s step-end infinite",
        "slide-in-left": "slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInRight: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
};
