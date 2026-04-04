import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: './vitest.setup.ts',
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.FAL_KEY': JSON.stringify(env.FAL_KEY ?? env.VITE_FAL_KEY),
        'process.env.VITE_FAL_KEY': JSON.stringify(env.VITE_FAL_KEY ?? env.FAL_KEY),
        'process.env.VITE_FAL_EXPERIMENTAL_MODEL': JSON.stringify(env.VITE_FAL_EXPERIMENTAL_MODEL)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
