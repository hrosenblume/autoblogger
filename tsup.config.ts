import { defineConfig } from 'tsup'

export default defineConfig([
  // Main entry (server-safe)
  {
    entry: {
      index: 'src/index.ts',
      'lib/seo': 'src/lib/seo.ts',
      'lib/markdown': 'src/lib/markdown.ts',
      'lib/rich-text': 'src/lib/rich-text.ts',
      'styles/article': 'src/styles/article.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom'],
  },
  // UI entry (client-side, React)
  {
    entry: {
      ui: 'src/ui/index.ts',
    },
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    external: ['react', 'react-dom'],
    esbuildOptions(options) {
      options.banner = { js: '"use client";' }
    },
  },
  // CLI entry
  {
    entry: {
      'cli/index': 'src/cli/index.ts',
    },
    format: ['cjs'],
    dts: false,
    splitting: false,
    sourcemap: false,
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
])
