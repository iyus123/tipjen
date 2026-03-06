import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 20px 45px rgba(87, 63, 50, 0.12)",
      },
      colors: {
        brand: {
          cream: "#f7efe7",
          sand: "#ead9cc",
          cocoa: "#4f342b",
          blush: "#f2dfd3",
          dark: "#0f172a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
