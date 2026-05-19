import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/integration/setup.ts'],
    include: ['tests/integration/**/*.test.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/index.tsx',
        'src/vite-env.d.ts',
        'src/types.ts',
        '**/*.d.ts',
        'node_modules/**',
        'src/components/**',
        'src/api.ts',
      ],
      reportsDirectory: './coverage/integration',
    },
  },
});