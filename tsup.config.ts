import { defineConfig } from 'tsup'

export default defineConfig([
  // Main entry (server-safe)
  {
    entry: {
      index: 'src/index.ts',
      'lib/seo': 'src/lib/seo.ts',
      'lib/markdown': 'src/lib/markdown.ts',
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
])
