import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Config untuk GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/karyakaca-pos2/', // sesuaikan dengan nama repo GitHub
})
