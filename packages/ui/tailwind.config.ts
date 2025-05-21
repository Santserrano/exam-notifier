import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#fff",
        foreground: "#000",
      },
      borderColor: {
        border: "rgb(229, 231, 235)",
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
  safelist: [
    "bg-green-600",
    "bg-blue-600",
    "bg-green-100",
    "bg-blue-100",
    "border-green-300",
    "border-blue-300",
    "text-green-800",
    "text-blue-800"
  ],
};

export default config;
