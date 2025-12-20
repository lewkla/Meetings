import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Используем node вместо браузера для простоты
    include: ['**/*.spec.ts'],
    exclude: ['node_modules/**', 'dist/**']
  }
});
