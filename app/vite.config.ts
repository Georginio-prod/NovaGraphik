import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'

// Dev-only proxy target. The backend port comes from the env (defaults to 3001),
// so there is no hardcoded port. Set DEV_API_TARGET to override the whole URL,
// or BACKEND_PORT to just change the port the backend listens on locally.
const devApiTarget =
  process.env.DEV_API_TARGET ||
  `http://localhost:${process.env.BACKEND_PORT || process.env.PORT || 3001}`

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ui()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: devApiTarget,
        changeOrigin: true,
      },
      '/uploads': {
        target: devApiTarget,
        changeOrigin: true,
      },
    },
  },
  // `npm start` runs `vite preview`, whose host check blocks unknown domains.
  // Allow any host so the app works behind any platform/proxy without
  // hardcoding a provider-specific domain.
  preview: {
    allowedHosts: true,
  },
})
