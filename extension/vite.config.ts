import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import {
  mkdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from 'fs';

function fixPopupPathsPlugin() {
  return {
    name: 'fix-popup-paths',
    closeBundle() {
      const srcHtml = resolve(__dirname, 'dist/src/popup/index.html');
      const destDir = resolve(__dirname, 'dist/popup');
      if (!existsSync(srcHtml)) return;

      let html = readFileSync(srcHtml, 'utf-8');
      html = html.replace(/\.\.\/\.\.\/assets\//g, '../assets/');

      if (!existsSync(destDir)) {
        mkdirSync(destDir, { recursive: true });
      }
      writeFileSync(resolve(destDir, 'index.html'), html);
      rmSync(resolve(__dirname, 'dist/src'), { recursive: true, force: true });
    },
  };
}

export default defineConfig({
  plugins: [react(), fixPopupPathsPlugin()],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        content: resolve(__dirname, 'src/content/index.ts'),
        background: resolve(__dirname, 'src/background/index.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'content') return 'content.js';
          if (chunkInfo.name === 'background') return 'background.js';
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
