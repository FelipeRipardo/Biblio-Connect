import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    //Encaminha as chamadas /api para o back-end Spring Boot (evita problemas de CORS em desenvolvimento)
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});
