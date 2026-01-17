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
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
}
