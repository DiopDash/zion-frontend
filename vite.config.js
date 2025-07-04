import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // This line requires the new package

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // This line enables Tailwind v4 correctly
  ],
})