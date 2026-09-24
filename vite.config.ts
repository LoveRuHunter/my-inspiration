import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Vite 8 (rolldown-based) и vite, вкорнутый в vitest 3, различаются по типам плагинов.
// Поле `test` инжектится vitest'ом в рантайме, поэтому подавляем проверку.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    // Слегка поднимаем порог, чтобы варнинг был по-настоящему мотивирующим — 750 KB на chunk.
    chunkSizeWarningLimit: 750,
    rolldownOptions: {
      output: {
        // Rolldown в Vite 8 принимает manualChunks только функцией.
        // Разводим тяжёлые вендор-пакеты по отдельным чанкам — браузер кэширует их отдельно.
        manualChunks: (id: string): string | undefined => {
          if (id.includes('node_modules')) {
            if (id.includes('three') && !id.includes('@react-three')) return 'three';
            if (id.includes('@react-three/postprocessing') || id.includes('postprocessing'))
              return 'postfx';
            if (id.includes('@react-three/')) return 'r3f';
            if (id.includes('framer-motion')) return 'motion';
          }
          return undefined;
        },
      },
    },
  },
  // @ts-expect-error — vitest дополняет UserConfig полем `test`
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
