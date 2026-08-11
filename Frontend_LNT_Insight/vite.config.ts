import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5063', // Đường dẫn của ASP.NET Core Backend
        changeOrigin: true,             // Thay đổi origin của host header sang target URL
        secure: false,                  // Chấp nhận cả chứng chỉ SSL không hợp lệ khi dev
      }
    }
  }
})
