import { vitePlugin as remix } from "@remix-run/dev";
import { vercelPreset } from "@vercel/remix/vite";
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    remix({
      serverModuleFormat: "esm",
      presets: [vercelPreset()],
      future: {
        unstable_optimizeDeps: true,
        v3_fetcherPersist: true,
        v3_lazyRouteDiscovery: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
  ],
  resolve: {
    alias: {
      "~": resolve(__dirname, "./app"),
      "@exam-notifier/ui": resolve(__dirname, "../../packages/ui/src"),
      "@exam-notifier/internal-nobuild": resolve(__dirname, "../../packages/internal-nobuild/src"),
    },
  },
});
