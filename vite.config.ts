import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Force redeploy to ensure all assets including Trinity, Curated Itineraries, and Premium Locations images are properly served
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor': ['react', 'react-dom', 'react-router-dom'],
              'animations': ['framer-motion'],
            },
          },
        },
        // Minification with esbuild (default, faster and simpler)
        minify: 'esbuild',
        // Target modern browsers for smaller bundle
        target: 'esnext',
        cssCodeSplit: true,
        // Enable source maps for production debugging if needed
        sourcemap: false,
      },
      plugins: [react()],
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
