import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'  
import tailwindcss from '@tailwindcss/vite'
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),         
    tailwindcss(),
    svgr({
      exportAsDefault: false, 
    }),
  ],
  server: {
    headers: {
      "Content-Security-Policy": "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173"
    }
  }
})
