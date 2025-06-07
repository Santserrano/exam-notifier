import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: {
    resolve: true,
    entry: 'src/index.ts'
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  target: 'node18',
  minify: false,
  treeshake: true,
  env: {
    NODE_ENV: 'production'
  },
  platform: 'node',
  esbuildOptions(options) {
    options.banner = {
      js: 'import { createRequire } from "module"; const require = createRequire(import.meta.url);',
    }
  }
}) 