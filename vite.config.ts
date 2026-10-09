import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      hmr: false,
      watch: {
        ignored: [
          '**/*.log',
          '**/*.db',
          '**/*.db-wal',
          '**/*.db-shm',
          '**/*.sqlite',
          '**/*.json',
          '**/*.pid'
        ]
      },
    },
  };
});
