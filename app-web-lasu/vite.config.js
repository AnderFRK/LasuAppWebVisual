import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // AQUÍ ESTÁ LA CLAVE PARA GITHUB PAGES:
  base: '/LasuAppWebVisual/', 
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})