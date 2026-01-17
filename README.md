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
- Creates config, API route, and dashboard page (in isolated route group)
- Adds the standalone CSS import to your globals.css
- Fixes hydration warnings for theme switching
- Runs the database migration

Visit `/writer` to start writing.

## Features

- **AI Writing** — Generate essays with Claude or GPT. Stream responses in real-time.
- **Chat Modes** — Ask questions, let AI edit directly (Agent mode), or generate outlines (Plan mode).
- **Web Search** — Ground AI responses with real-time web search (works with all models).
- **Thinking Mode** — Extended thinking for more thoughtful Claude responses.
- **WYSIWYG Editor** — Tiptap-based editor with formatting toolbar. Syncs to markdown.
- **Revision History** — Every save creates a revision. Browse and restore any version.
- **Inline Comments** — Highlight text and leave threaded comments.
- **RSS Auto-Draft** — Subscribe to feeds, filter by keywords, auto-generate drafts.
- **CMS Integrations** — Sync posts to Prismic, Contentful, Sanity, or custom destinations.
- **User Roles** — Admin, writer, and drafter with different permissions.
- **SEO Fields** — Custom title, description, keywords, and OG image per post.

## Requirements

- Next.js 14, 15, or 16 (App Router)
- Prisma 5 or 6
- Node.js 20+
- Any CSS setup (Tailwind optional — standalone CSS included)

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
| ⌘S | Save draft |
| Esc | Go back / Stop generation |

## Package Exports

```typescript
// Server
import { createAutoblogger, runAutoDraft } from 'autoblogger'
import { createDestinationDispatcher } from 'autoblogger'
import type { Destination, DestinationResult } from 'autoblogger'

// UI
import { AutobloggerDashboard } from 'autoblogger/ui'
import { ChatProvider, ChatPanel, ChatButton } from 'autoblogger/ui'

// Utilities
import { renderMarkdown, htmlToMarkdown } from 'autoblogger/markdown'
import { getSeoValues } from 'autoblogger/seo'
import { ARTICLE_CLASSES } from 'autoblogger/styles/article'

// Rich text converters (for custom destination adapters)
import { 
  markdownToPrismicRichText,
  markdownToContentfulRichText,
  markdownToPortableText,
} from 'autoblogger/rich-text'
```

## CMS Integrations

Autoblogger can sync published posts to external CMSs like Prismic, Contentful, or Sanity.

### Prismic (Built-in)

Configure Prismic integration via the Settings UI or in code:

```typescript
export const cms = createAutoblogger({
  // ... other config
  prismic: {
    repository: 'your-repo',
    writeToken: process.env.PRISMIC_WRITE_TOKEN,
  },
})
```

Then enable it in Settings → CMS Integrations → Prismic.

**Sync Modes:**
- **Stub** (default): Only syncs the post slug as UID. Content lives in autoblogger, Prismic stores references for collection slices.
- **Full**: Syncs complete content as Prismic rich text.

### Custom Destinations

Create custom adapters for any CMS:

```typescript
import { createAutoblogger, type Destination } from 'autoblogger'

const myDestination: Destination = {
  name: 'my-cms',
  async onPublish(post) {
    // Sync post to your CMS
    return { success: true, externalId: 'doc-123' }
  },
  async onUnpublish(post) {
    return { success: true }
  },
  async onDelete(post) {
    return { success: true }
  },
}

export const cms = createAutoblogger({
  // ... other config
  destinations: [myDestination],
})
```

### Webhooks

Send POST requests to URLs when posts are published/unpublished/deleted:

```typescript
export const cms = createAutoblogger({
  // ... other config
  webhooks: ['https://api.example.com/cms-webhook'],
})
```

## Styling

Autoblogger ships with standalone CSS that works with any setup — no Tailwind required.

**Using the CLI?** It automatically adds the import for you.

**Manual setup?** Add to your `globals.css`:
```css
@import 'autoblogger/styles/standalone.css';
```

This single import includes all styles needed for the dashboard. Works with Tailwind v3, v4, CSS Modules, vanilla CSS, or no CSS framework at all.

### Advanced: Customizing Theme Colors

If you use Tailwind and want autoblogger to inherit your theme colors, you can use the preset instead:

```javascript
// tailwind.config.js (Tailwind v3 only)
module.exports = {
  presets: [require('autoblogger/styles/preset')],
  content: [
    // your paths...
    './node_modules/autoblogger/dist/**/*.{js,mjs}',
  ],
}
```

Then import the base styles (without utilities):
```css
@import 'autoblogger/styles/autoblogger.css';
```

## Troubleshooting

**AI not working?** Check your environment variables:
```bash
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."
```

**Hydration warnings with theme?** The CLI automatically adds `suppressHydrationWarning` to your root layout. If you set up manually, add it to your `<html>` tag:
```tsx
<html lang="en" suppressHydrationWarning>
```

**Layout conflicts?** The CLI creates the writer dashboard in an isolated route group `app/(writer)/writer/` to prevent inheriting your app's navbar/footer.

## License

MIT © [Hunter Rosenblume](https://github.com/hrosenblume)
