import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    // Proxy para dev local: /api/ → http://localhost:8080/api/
    // Permite que import.meta.env.PROD === false use BASE_URL directo,
    // o si prefieres BASE_URL="" también en dev, descomenta el proxy:
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8080',
    //     changeOrigin: true,
    //   },
    // },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
