import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendPort = env.PORT || '5000';

  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      watch: {
        ignored: ['**/github-ecosystem/**', '**/dist/**', '**/.git/**']
      },
      proxy: {
        '/api': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
          secure: false
        }
      }
    }
  };
});
