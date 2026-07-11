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
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: [
          '**/storage/**',
          '**/*.log',
          '*.log',
          'bot_dev.log',
          'bot.pid',
          '**/*.pid',
          '**/*-wal',
          '**/*-shm',
          '*.db-wal',
          '*.db-shm',
          '**/Daltoon_Bot.json',
          '**/database.json',
          '**/*.json',
          '**/*.db',
          '*.db',
          '**/*.sqlite',
          '*.sqlite',
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
