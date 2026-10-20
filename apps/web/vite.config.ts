import process from 'node:process'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const backend = `http://127.0.0.1:${process.env.MCU_PORT || 3211}`

export default defineConfig({
  plugins: [react()],
  // 桌面端与后端托管时都从根路径访问
  base: '/',
  server: {
    port: 9999,
    proxy: {
      '/api': backend,
      '/ws': { target: backend, ws: true },
    },
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500,
  },
})
