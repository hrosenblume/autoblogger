# Autoblogger

A headless CMS with AI writing tools, WYSIWYG editor, and RSS auto-draft for Next.js.

## Features

- **AI Writing** - Generate and edit essays with Claude or GPT
- **WYSIWYG Editor** - Tiptap-based editor with markdown support
- **RSS Auto-Draft** - Subscribe to feeds and auto-generate drafts
- **Custom Fields** - Extend posts with site-specific fields
- **WYSIWYG Parity** - Editor matches your public page styling

## Installation

```bash
npm install autoblogger
```

## Quick Start

### 1. Copy and merge schema

```bash
cp node_modules/autoblogger/prisma/schema.prisma ./prisma/
npx prisma migrate dev --name add-autoblogger
```

### 2. Configure CMS

```typescript
// lib/cms.ts
import { createAutoblogger } from 'autoblogger'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const cms = createAutoblogger({
  prisma,
  
  auth: {
    getSession: auth,
    isAdmin: (session) => session?.user?.role === 'admin',
    canPublish: (session) => ['admin', 'writer'].includes(session?.user?.role ?? ''),
  },
  
  ai: {
    anthropicKey: process.env.ANTHROPIC_API_KEY,
    openaiKey: process.env.OPENAI_API_KEY,
  },
  
  storage: {
    upload: async (file) => {
      // Your upload implementation
      return { url: 'https://...' }
    }
  },
  
  styles: {
    container: 'max-w-2xl mx-auto px-6',
    title: 'text-2xl font-bold',
    prose: 'prose dark:prose-invert max-w-none',
  },
})

export const cmsStyles = cms.config.styles
```

### 3. Mount API

```typescript
// app/api/cms/[...path]/route.ts
import { cms } from '@/lib/cms'
import { createAPIHandler } from 'autoblogger'

const handler = createAPIHandler(cms, { basePath: '/api/cms' })

export const GET = handler
export const POST = handler
export const PATCH = handler
export const DELETE = handler
```

### 4. Mount Dashboard

```typescript
// app/writer/[[...path]]/page.tsx
'use client'

import { AutobloggerDashboard } from 'autoblogger/ui'
import { cmsStyles } from '@/lib/cms'

export default function WriterPage() {
  return (
    <AutobloggerDashboard 
      basePath="/writer"
      apiBasePath="/api/cms"
      styles={cmsStyles}
    />
  )
}
```

### 5. Add Tailwind preset

```javascript
// tailwind.config.js
module.exports = {
  presets: [require('autoblogger/styles/preset')],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './node_modules/autoblogger/dist/**/*.{js,jsx}',
  ],
}
```

### 6. Use in public pages

```typescript
// app/blog/[slug]/page.tsx
import { cms } from '@/lib/cms'
import { renderMarkdown, getSeoValues } from 'autoblogger'

export default async function PostPage({ params }) {
  const post = await cms.posts.findBySlug(params.slug)
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(post.markdown) }} />
    </article>
  )
}

export async function generateMetadata({ params }) {
  const post = await cms.posts.findBySlug(params.slug)
  const seo = getSeoValues(post)
  return { title: seo.title, description: seo.description }
}
```

## Custom Fields

Add site-specific fields to posts:

```typescript
// app/writer/[[...path]]/page.tsx
import { AutobloggerDashboard } from 'autoblogger/ui'
import { MyCustomField } from '@/components/MyCustomField'

export default function WriterPage() {
  return (
    <AutobloggerDashboard 
      basePath="/writer"
      apiBasePath="/api/cms"
      fields={[
        { name: 'customData', label: 'Custom', component: MyCustomField, position: 'footer' }
      ]}
    />
  )
}
```

## License

MIT
