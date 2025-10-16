import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuração para Electron
  base: process.env.ELECTRON === 'true' ? './' : '/',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'framer-motion'],
          pdf: ['jspdf', 'html2canvas', 'jspdf-autotable'],
        }
      }
    }
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
  
  preview: {
    port: 5173,
    strictPort: true,
  },
  
  // Otimizações
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'zustand',
      'localforage',
      'date-fns',
      'lucide-react',
      'framer-motion',
      'jspdf',
      'html2canvas'
    ],
  },
});