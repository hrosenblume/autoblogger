/** @type {import('tailwindcss').Config} */
const preset = require('./src/styles/preset.js')

module.exports = {
  // Scope all utilities to .autoblogger for isolation from host styles
  important: '.autoblogger',
  content: ['./src/ui/**/*.tsx'],
  theme: {
    extend: {
      ...preset.theme?.extend,
      typography: {
        // Custom chat prose style - tighter spacing for chat bubbles
        chat: {
          css: {
            '--tw-prose-body': 'inherit',
            '--tw-prose-headings': 'inherit',
            '--tw-prose-links': 'var(--ab-primary)',
            '--tw-prose-bold': 'inherit',
            '--tw-prose-code': 'inherit',
            '--tw-prose-pre-bg': 'var(--ab-muted)',
            color: 'inherit',
            maxWidth: 'none',
            // Tighter spacing for chat
            p: { marginTop: '0', marginBottom: '0.75em' },
            'h1, h2, h3, h4': { 
              marginTop: '1.25em', 
              marginBottom: '0.5em',
              fontWeight: '600',
            },
            h1: { fontSize: '1.25em' },
            h2: { fontSize: '1.125em' },
            h3: { fontSize: '1em' },
            ul: { marginTop: '0.5em', marginBottom: '0.75em', paddingLeft: '1.25em' },
            ol: { marginTop: '0.5em', marginBottom: '0.75em', paddingLeft: '1.25em' },
            li: { marginTop: '0.25em', marginBottom: '0.25em' },
            'ul > li': { paddingLeft: '0.25em' },
            'ol > li': { paddingLeft: '0.25em' },
            blockquote: { 
              marginTop: '0.75em', 
              marginBottom: '0.75em',
              paddingLeft: '1em',
              borderLeftWidth: '3px',
              fontStyle: 'italic',
            },
            code: { 
              backgroundColor: 'var(--ab-muted)',
              padding: '0.125em 0.375em',
              borderRadius: '0.25em',
              fontWeight: '400',
            },
            'code::before': { content: 'none' },
            'code::after': { content: 'none' },
            pre: { 
              marginTop: '0.75em', 
              marginBottom: '0.75em',
              padding: '0.75em 1em',
              borderRadius: '0.5em',
              backgroundColor: 'var(--ab-muted)',
            },
            'pre code': { 
              backgroundColor: 'transparent',
              padding: '0',
            },
            hr: { marginTop: '1.5em', marginBottom: '1.5em' },
            a: { textDecoration: 'underline' },
            strong: { fontWeight: '600' },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
