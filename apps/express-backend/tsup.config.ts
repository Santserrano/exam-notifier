import { defineConfig } from 'tsup'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
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
    options.define = {
      __dirname: JSON.stringify(__dirname)
    }
  }
}) 