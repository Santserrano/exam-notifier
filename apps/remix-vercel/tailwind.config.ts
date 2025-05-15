import type { Config } from "tailwindcss";

import { shadcnPreset } from "@exam-notifier/ui/tailwind";

export default {
  content: [
    "./app/**/*.{ts,jsx,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  presets: [shadcnPreset],
} satisfies Config;
