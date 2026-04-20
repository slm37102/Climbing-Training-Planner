import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['icons/icon-192.png', 'icons/icon-512.png'],
          manifest: {
            name: 'Climbing Training Planner',
            short_name: 'CTP',
            description: 'Plan, track, and progress your climbing training.',
            theme_color: '#f59e0b',
            background_color: '#0c0a09',
            display: 'standalone',
            start_url: '/',
            scope: '/',
            icons: [
              {
                src: 'icons/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable',
              },
              {
                src: 'icons/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable',
              },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
            navigateFallbackDenylist: [/^\/__/, /^\/api\//],
          },
          devOptions: {
            enabled: false,
          },
        }),
      ],
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor-firebase': [
                'firebase/app',
                'firebase/auth',
                'firebase/firestore',
              ],
              'vendor-react': ['react', 'react-dom'],
            },
          },
        },
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
