import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
} satisfies Config;
