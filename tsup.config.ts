import { defineConfig } from 'tsup'

export default defineConfig([
  // Main bundle with dts
  {
    entry: {
      index: 'src/index.ts',
      ui: 'src/ui/dashboard.tsx',
      'styles/article': 'src/styles/article.ts',
      'lib/seo': 'src/lib/seo.ts',
      'lib/markdown': 'src/lib/markdown.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', 'next', '@prisma/client'],
    esbuildOptions(options) {
      options.banner = {
        js: '"use client";',
      }
    },
  },
  // Preset JS file (no dts needed)
  {
    entry: {
      'styles/preset': 'src/styles/preset.js',
    },
    format: ['cjs'],
    dts: false,
    splitting: false,
    sourcemap: true,
  },
])
