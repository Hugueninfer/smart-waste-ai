import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ base: '/smart-waste-ai/', plugins: [react()], test: { environment: 'jsdom', setupFiles: './src/test/setup.ts' } } as any)
