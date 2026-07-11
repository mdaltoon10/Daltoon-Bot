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
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: {
        ignored: [
          '**/storage/**',
          '**/*.log',
          '**/Daltoon_Bot.json',
          '**/database.json',
          '**/*.json',
          '**/*.db',
          '**/*.sqlite',
          'Daltoon_Bot.json',
          'database.json',
          'package.json',
          '**/backup/**',
          path.resolve(__dirname, 'Daltoon_Bot.json'),
          path.resolve(__dirname, 'database.json'),
          path.resolve(__dirname, 'package.json'),
        ]
      },
    },
  };
});
