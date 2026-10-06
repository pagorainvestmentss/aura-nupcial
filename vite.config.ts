import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// defineConfig de 'vitest/config' é um superconjunto do da 'vite' — permite
// o bloco `test` abaixo sem perder nada da configuração normal.
import {defineConfig} from 'vitest/config';

export default defineConfig(() => {
  return {
    // VITE_BASE permite servir o site num subcaminho (ex.: GitHub Pages /aura-nupcial/)
    base: process.env.VITE_BASE || '/',
    plugins: [react(), tailwindcss()],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      // Cada teste parte de um localStorage limpo (o setup limpa antes de cada um)
      globals: false,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
