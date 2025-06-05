import vue from '@vitejs/plugin-vue2';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/main.js'),
        options: resolve(__dirname, 'src/options/main.js')
      },
      output: {
        entryFileNames: chunk => `${chunk.name}.js`
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  publicDir: 'public'
});
