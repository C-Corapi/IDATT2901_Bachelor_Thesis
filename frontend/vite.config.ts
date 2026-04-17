import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/epics':       'http://localhost:8000',
      '/decisions':   'http://localhost:8000',
      '/deliverables':'http://localhost:8000',
      '/tasks':       'http://localhost:8000',
      '/activities':  'http://localhost:8000',
      '/documents':   'http://localhost:8000',
    },
  },
});