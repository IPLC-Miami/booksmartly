import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  // Load env files (e.g., .env, .env.production)
  const env = loadEnv(mode, process.cwd(), '');
  return defineConfig({
    base: '/',
    plugins: [react()],
    define: {
      'process.env': {
        VITE_SUPABASE_URL: JSON.stringify(env.VITE_SUPABASE_URL),
        VITE_SUPABASE_ANON_KEY: JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
      }
    },
    build: {
      rollupOptions: {
        external: ['dotenv'],
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@radix-ui/themes', '@radix-ui/react-icons']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    optimizeDeps: {
      exclude: ['dotenv']
    }
  });
};
