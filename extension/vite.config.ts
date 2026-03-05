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
import { build as esbuild } from 'esbuild';

function loadEnv() {
  const envPath = resolve(__dirname, '.env');
  if (!existsSync(envPath)) return {};
  const content = readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...rest] = trimmed.split('=');
    env[key.trim()] = rest.join('=').trim();
  }
  return env;
}

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

function buildScriptsPlugin() {
  return {
    name: 'build-scripts',
    async closeBundle() {
      const env = loadEnv();
      const define = {
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
      };

      await esbuild({
        entryPoints: [resolve(__dirname, 'src/background/index.ts')],
        bundle: true,
        outfile: resolve(__dirname, 'dist/background.js'),
        format: 'esm',
        target: 'chrome120',
        minify: true,
        define,
      });

      await esbuild({
        entryPoints: [resolve(__dirname, 'src/content/index.ts')],
        bundle: true,
        outfile: resolve(__dirname, 'dist/content.js'),
        format: 'iife',
        target: 'chrome120',
        minify: true,
        define,
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), fixPopupPathsPlugin(), buildScriptsPlugin()],
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
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
