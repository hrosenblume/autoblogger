/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      fontSize: {
        'ab-title': ['24px', { lineHeight: '1.2' }],
        'ab-h1': ['22px', { lineHeight: '1.3' }],
        'ab-h2': ['18px', { lineHeight: '1.4' }],
        'ab-h3': ['16px', { lineHeight: '1.4' }],
        'ab-body': ['16px', { lineHeight: '1.6' }],
        'ab-table': ['14px', { lineHeight: '1.5' }],
      },
      maxWidth: {
        'ab-content': '680px',
      },
      spacing: {
        'ab-content-padding': '24px',
      },
    },
  },
}
