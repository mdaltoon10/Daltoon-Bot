import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));

export default defineConfig(() => {
  return {
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version || '5.2.4'),
    },
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
