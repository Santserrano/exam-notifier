import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#fff",
        foreground: "#000",
      },
      borderColor: {
        border: "rgb(229, 231, 235)",
      },
    },
  },
  plugins: [],
};

export default config;
