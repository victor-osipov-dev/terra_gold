import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['ai-box-cars.ru'],
    hmr: {
      protocol: 'wss',
      host: 'ai-box-cars.ru',
      clientPort: 443
    }
  }
})
