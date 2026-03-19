import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Altre configurazioni utili per Medusa (es. port, server proxy se necessario)
  server: {
    port: 3000,
    open: true,
  },
});
