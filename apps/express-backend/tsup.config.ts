import { defineConfig } from 'tsup'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
      __dirname: JSON.stringify(__dirname),
      __filename: JSON.stringify(__filename)
    }
  }
}) 