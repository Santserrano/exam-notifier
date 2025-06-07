// vite.config.ts
import { resolve } from "path";
import { vitePlugin as remix } from "file:///C:/exam-notifier/node_modules/@remix-run/dev/dist/index.js";
import { vercelPreset } from "file:///C:/exam-notifier/node_modules/@vercel/remix/vite.js";
import { defineConfig } from "file:///C:/exam-notifier/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "C:\\exam-notifier\\apps\\remix-vercel";
var vite_config_default = defineConfig({
  plugins: [
    remix({
      serverModuleFormat: "esm",
      presets: [vercelPreset()],
      future: {
        unstable_optimizeDeps: true,
        v3_fetcherPersist: true,
        v3_lazyRouteDiscovery: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true
      }
    })
  ],
  build: {
    target: "esnext",
    modulePreload: true,
    rollupOptions: {
      output: {
        format: "esm"
      }
    }
  },
  resolve: {
    alias: {
      "~": resolve(__vite_injected_original_dirname, "./app"),
      "@exam-notifier/ui": resolve(__vite_injected_original_dirname, "../../packages/ui/src"),
      "@exam-notifier/internal-nobuild": resolve(
        __vite_injected_original_dirname,
        "../../packages/internal-nobuild/src"
      )
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxleGFtLW5vdGlmaWVyXFxcXGFwcHNcXFxccmVtaXgtdmVyY2VsXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxleGFtLW5vdGlmaWVyXFxcXGFwcHNcXFxccmVtaXgtdmVyY2VsXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9leGFtLW5vdGlmaWVyL2FwcHMvcmVtaXgtdmVyY2VsL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyB2aXRlUGx1Z2luIGFzIHJlbWl4IH0gZnJvbSBcIkByZW1peC1ydW4vZGV2XCI7XG5pbXBvcnQgeyB2ZXJjZWxQcmVzZXQgfSBmcm9tIFwiQHZlcmNlbC9yZW1peC92aXRlXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgcmVtaXgoe1xuICAgICAgc2VydmVyTW9kdWxlRm9ybWF0OiBcImVzbVwiLFxuICAgICAgcHJlc2V0czogW3ZlcmNlbFByZXNldCgpXSxcbiAgICAgIGZ1dHVyZToge1xuICAgICAgICB1bnN0YWJsZV9vcHRpbWl6ZURlcHM6IHRydWUsXG4gICAgICAgIHYzX2ZldGNoZXJQZXJzaXN0OiB0cnVlLFxuICAgICAgICB2M19sYXp5Um91dGVEaXNjb3Zlcnk6IHRydWUsXG4gICAgICAgIHYzX3JlbGF0aXZlU3BsYXRQYXRoOiB0cnVlLFxuICAgICAgICB2M190aHJvd0Fib3J0UmVhc29uOiB0cnVlLFxuICAgICAgfSxcbiAgICB9KSxcbiAgXSxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6IFwiZXNuZXh0XCIsXG4gICAgbW9kdWxlUHJlbG9hZDogdHJ1ZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZm9ybWF0OiBcImVzbVwiLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiflwiOiByZXNvbHZlKF9fZGlybmFtZSwgXCIuL2FwcFwiKSxcbiAgICAgIFwiQGV4YW0tbm90aWZpZXIvdWlcIjogcmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi4vLi4vcGFja2FnZXMvdWkvc3JjXCIpLFxuICAgICAgXCJAZXhhbS1ub3RpZmllci9pbnRlcm5hbC1ub2J1aWxkXCI6IHJlc29sdmUoXG4gICAgICAgIF9fZGlybmFtZSxcbiAgICAgICAgXCIuLi8uLi9wYWNrYWdlcy9pbnRlcm5hbC1ub2J1aWxkL3NyY1wiLFxuICAgICAgKSxcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdTLFNBQVMsZUFBZTtBQUN4VCxTQUFTLGNBQWMsYUFBYTtBQUNwQyxTQUFTLG9CQUFvQjtBQUM3QixTQUFTLG9CQUFvQjtBQUg3QixJQUFNLG1DQUFtQztBQUt6QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsTUFDSixvQkFBb0I7QUFBQSxNQUNwQixTQUFTLENBQUMsYUFBYSxDQUFDO0FBQUEsTUFDeEIsUUFBUTtBQUFBLFFBQ04sdUJBQXVCO0FBQUEsUUFDdkIsbUJBQW1CO0FBQUEsUUFDbkIsdUJBQXVCO0FBQUEsUUFDdkIsc0JBQXNCO0FBQUEsUUFDdEIscUJBQXFCO0FBQUEsTUFDdkI7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixlQUFlO0FBQUEsSUFDZixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixRQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQy9CLHFCQUFxQixRQUFRLGtDQUFXLHVCQUF1QjtBQUFBLE1BQy9ELG1DQUFtQztBQUFBLFFBQ2pDO0FBQUEsUUFDQTtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
