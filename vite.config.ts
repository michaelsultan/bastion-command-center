import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
    proxy: {
      // GDELT n'envoie pas d'en-têtes CORS fiables : proxy local en dev.
      '/api/gdelt': {
        target: 'https://api.gdeltproject.org/api/v2/doc/doc',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/gdelt/, ''),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
