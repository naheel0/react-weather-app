import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/react-weather-app/', // 👈 Add this line
  plugins: [
    react(),       // 👈 adds React JSX transform support
    tailwindcss(), // 👈 keeps Tailwind working
  ],
})
