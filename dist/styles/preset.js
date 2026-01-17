/** @type {import('tailwindcss').Config} */
module.exports = {
  // Custom dark mode variant that only triggers on .autoblogger.dark
  // This isolates autoblogger's theme from the host app's theme
  plugins: [
    function({ addVariant }) {
      addVariant('ab-dark', '.autoblogger.dark &')
    }
  ],
  theme: {
    extend: {
      fontSize: {
        title: ['24px', { lineHeight: '1.2' }],
        h1: ['22px', { lineHeight: '1.3' }],
        h2: ['18px', { lineHeight: '1.4' }],
        h3: ['16px', { lineHeight: '1.4' }],
        body: ['16px', { lineHeight: '1.6' }],
        table: ['14px', { lineHeight: '1.5' }],
      },
      maxWidth: {
        content: '680px',
      },
      spacing: {
        'content-padding': '24px',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        
        // Semantic tokens (auto-switch with theme, prefixed to avoid conflicts)
        'ab-success': 'rgb(var(--ab-success) / <alpha-value>)',
        'ab-success-muted': 'rgb(var(--ab-success-muted) / <alpha-value>)',
        'ab-warning': 'rgb(var(--ab-warning) / <alpha-value>)',
        'ab-warning-subtle': 'rgb(var(--ab-warning-subtle) / <alpha-value>)',
        'ab-active': 'rgb(var(--ab-active) / <alpha-value>)',
        'ab-neutral': 'rgb(var(--ab-neutral) / <alpha-value>)',
        'ab-neutral-subtle': 'rgb(var(--ab-neutral-subtle) / <alpha-value>)',
        'ab-neutral-border': 'rgb(var(--ab-neutral-border) / <alpha-value>)',
        'ab-neutral-strong': 'rgb(var(--ab-neutral-strong) / <alpha-value>)',
        'ab-surface-input': 'rgb(var(--ab-surface-input) / <alpha-value>)',
        'ab-highlight': 'rgb(var(--ab-highlight) / <alpha-value>)',
        'ab-highlight-strong': 'rgb(var(--ab-highlight-strong) / <alpha-value>)',
        'ab-highlight-border': 'rgb(var(--ab-highlight-border) / <alpha-value>)',
        'ab-placeholder': 'rgb(var(--ab-placeholder) / <alpha-value>)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
}
