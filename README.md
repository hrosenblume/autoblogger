# Autoblogger

[![npm version](https://img.shields.io/npm/v/autoblogger.svg)](https://www.npmjs.com/package/autoblogger)
[![license](https://img.shields.io/npm/l/autoblogger.svg)](https://github.com/hrosenblume/autoblogger/blob/main/LICENSE)

An AI-powered CMS that embeds into your Next.js app. Write blog posts with AI assistance, manage revisions, handle comments, and auto-generate drafts from RSS feeds.

```bash
npm install autoblogger
```

## Quick Start

```bash
npx autoblogger init
```

The CLI automatically:
- Detects your Next.js and Prisma setup
- Adds required database models to your schema
- Creates config, API route, and dashboard page
- Patches Tailwind to include Autoblogger styles
- Runs the database migration

Visit `/writer` to start writing.

## Features

- **AI Writing** — Generate essays with Claude or GPT. Stream responses in real-time.
- **Chat Modes** — Ask questions, let AI edit directly (Agent mode), or generate outlines (Plan mode).
- **WYSIWYG Editor** — Tiptap-based editor with formatting toolbar. Syncs to markdown.
- **Revision History** — Every save creates a revision. Browse and restore any version.
- **Inline Comments** — Highlight text and leave threaded comments.
- **RSS Auto-Draft** — Subscribe to feeds, filter by keywords, auto-generate drafts.
- **User Roles** — Admin, writer, and drafter with different permissions.
- **SEO Fields** — Custom title, description, keywords, and OG image per post.

## Requirements

- Next.js 14 or 15 (App Router)
- Prisma 5 or 6
- Node.js 20+

For AI features, you'll need API keys from [Anthropic](https://console.anthropic.com/) and/or [OpenAI](https://platform.openai.com/).

## Configuration

The CLI creates `lib/cms.ts` for you. Customize it as needed:

```typescript
// lib/cms.ts
import { createAutoblogger } from 'autoblogger'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export const cms = createAutoblogger({
  prisma,
  auth: {
    getSession: () => auth(),
    isAdmin: (session) => session?.user?.role === 'admin',
    canPublish: (session) => ['admin', 'writer'].includes(session?.user?.role ?? ''),
  },
  ai: {
    anthropicKey: process.env.ANTHROPIC_API_KEY,
    openaiKey: process.env.OPENAI_API_KEY,
  },
})
```

## Displaying Posts

Fetch published posts for your public pages:

```typescript
// app/blog/page.tsx
import { cms } from '@/lib/cms'

export default async function BlogPage() {
  const { posts } = await cms.data.posts.findAll({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
  })
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}><a href={`/blog/${post.slug}`}>{post.title}</a></li>
      ))}
    </ul>
  )
}
```

Render a single post:

```typescript
// app/blog/[slug]/page.tsx
import { cms } from '@/lib/cms'
import { renderMarkdown } from 'autoblogger/markdown'
import { notFound } from 'next/navigation'

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await cms.data.posts.findBySlug(slug)
  
  if (!post || post.status !== 'published') notFound()
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.markdown) }} />
    </article>
  )
}
```

## CLI Reference

```bash
npx autoblogger init              # Interactive setup
npx autoblogger init --yes        # Use defaults, no prompts
npx autoblogger init --dry-run    # Preview changes
npx autoblogger import ./posts    # Import markdown files
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| ⌘K | Toggle chat panel |
| ⌘⇧A | Toggle Ask/Agent mode |
| ⌘. | Toggle theme |
| ⌘/ | Toggle view |
| N | New article |
| Esc | Go back |

## Package Exports

```typescript
// Server
import { createAutoblogger } from 'autoblogger'
import { runAutoDraft } from 'autoblogger'

// UI
import { AutobloggerDashboard } from 'autoblogger/ui'
import { ChatProvider, ChatPanel, ChatButton } from 'autoblogger/ui'

// Utilities
import { renderMarkdown, htmlToMarkdown } from 'autoblogger/markdown'
import { getSeoValues } from 'autoblogger/seo'
import { ARTICLE_CLASSES } from 'autoblogger/styles/article'
```

## Troubleshooting

**Tailwind classes not applying?** Add to your Tailwind content config:
```javascript
content: ['./node_modules/autoblogger/dist/**/*.{js,mjs}']
```

**Styles missing?** Import in `globals.css` before Tailwind directives:
```css
@import 'autoblogger/styles/autoblogger.css';
```

**AI not working?** Check your environment variables:
```bash
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."
```

## License

MIT © [Hunter Rosenblume](https://github.com/hrosenblume)
