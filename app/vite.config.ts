import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'

// The app talks directly to Supabase (Postgres + Storage) — there is no backend
// to proxy. Only the @ alias and Vue/UI plugins are needed.
// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), ui()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Fixed dev port so the preview/launch config reliably targets the server
  // (the nested npm workspace call doesn't forward `--port` to Vite).
  server: {
    port: 5180,
    strictPort: true,
  },
  // `npm start` runs `vite preview`; allow any host so it works behind any
  // platform/proxy without hardcoding a provider domain.
  preview: {
    allowedHosts: true,
  },
})
