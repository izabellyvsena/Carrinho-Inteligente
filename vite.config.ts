import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',    // Garante que o build sempre saia na pasta 'dist' raiz
      emptyOutDir: true, // Limpa qualquer vestígio de builds anteriores
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
