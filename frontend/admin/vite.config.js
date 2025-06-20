import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   host: '0.0.0.0', // Allow all network interfaces
  //   hmr: {
  //     clientPort: 5173 // Critical for mobile hot reload
  //   }
  // }
})
