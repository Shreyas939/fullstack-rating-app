import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'   // ✅ uncomment this
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),         // ✅ add this
    tailwindcss(),
  ],
  server: {
    headers: {
      "Content-Security-Policy": "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173"
    }
  }
})
