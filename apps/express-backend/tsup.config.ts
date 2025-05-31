import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  splitting: false,
  sourcemap: false,
  clean: true,
  target: 'es2020',
  minify: true,
  treeshake: true,
  env: {
    NODE_ENV: 'production'
  }
}) 