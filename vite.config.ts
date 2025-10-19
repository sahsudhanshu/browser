import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': resolve(rootDir, 'src/ui')
    }
  },
  build: {
    outDir: 'dist-react'
  },
  server: {
    port: 5123,
    strictPort: true
  }
})
