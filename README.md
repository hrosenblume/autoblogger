# ✨ Autoblogger

**The AI-native CMS that makes writing feel like magic.**

[![npm version](https://img.shields.io/npm/v/autoblogger.svg)](https://www.npmjs.com/package/autoblogger)
[![license](https://img.shields.io/npm/l/autoblogger.svg)](https://github.com/hrosenblume/autoblogger/blob/main/LICENSE)

Content is king. Speed is everything.

In the age of AI and SEO, the blogs that win are the ones that publish consistently. Autoblogger drops a complete AI-powered writing studio into your Next.js app—so you can go from idea to published post in minutes, not hours.

---

## 🚀 Quickstart

```bash
# Install
npm install autoblogger

# Initialize (auto-configures everything)
npx autoblogger init

# Add your AI key to .env
ANTHROPIC_API_KEY="sk-ant-..."

# Start your app and visit /writer
npm run dev
```

That's it. You're ready to write.

📖 **[Full Setup Guide →](docs/GUIDE.md)**

---

## Why Autoblogger?

**The game has changed.** AI-generated content is everywhere. SEO rewards fresh, frequent publishing. Your competitors are shipping blog posts while you're still wrestling with your CMS.

**You need to write fast.** Autoblogger makes that possible:

| Old Way | With Autoblogger |
|---------|------------------|
| Open CMS → Open ChatGPT → Copy-paste → Format → Publish | Type idea → AI writes → Edit → Publish |
| 2 hours per post | 15 minutes per post |
| "I should write more..." | Actually writing more |
| Content calendar anxiety | Content machine confidence |

---

## ⚡ How It Works

```
You: "Write about why morning routines are overrated"

Autoblogger: *generates a 500-word essay with title, subtitle, and body*

You: *tweak the intro, hit publish*

Done.
```

---

## Features

### 🤖 AI That Actually Helps

- **Generate from ideas** — Describe what you want, get a polished essay
- **Chat while you write** — Ask questions, get feedback, brainstorm
- **Agent mode** — Tell AI to edit your essay directly ("make the intro punchier")
- **Plan mode** — Generate outlines, then expand into full essays
- **Web search** — Ground AI responses with real-time information

### ✍️ Writing That Feels Good

- **Beautiful editor** — Tiptap-based WYSIWYG that syncs to markdown
- **Keyboard-first** — `⌘K` for chat, `⌘S` to save, `Esc` to navigate
- **Revision history** — Every save is a snapshot you can restore
- **Inline comments** — Highlight text, leave notes, collaborate

### 🔌 Plays Nice With Everything

- **Your database** — Uses your Prisma client, your schema
- **Your auth** — Plugs into NextAuth, Clerk, or custom auth
- **Your styles** — Standalone CSS included, Tailwind optional
- **External CMSs** — Sync to Prismic, Contentful, Sanity on publish

### 🤯 Automate Your Content Pipeline

- **RSS auto-draft** — Subscribe to feeds, auto-generate essays from news
- **Topic subscriptions** — Define keywords, get suggested posts daily
- **Webhooks** — Trigger workflows when posts are published

---

## Configuration

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

📖 **[See all configuration options →](docs/GUIDE.md#configuration-options)**

---

## Display Your Posts

```typescript
// app/blog/page.tsx
import { cms } from '@/lib/cms'

export default async function BlogPage() {
  const posts = await cms.posts.findPublished()
  
  return (
    <ul>
      {posts.map(post => (
        <li key={post.id}>
          <a href={`/blog/${post.slug}`}>{post.title}</a>
        </li>
      ))}
    </ul>
  )
}
```

```typescript
// app/blog/[slug]/page.tsx
import { cms } from '@/lib/cms'
import { renderMarkdown } from 'autoblogger/markdown'
import { notFound } from 'next/navigation'

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await cms.posts.findBySlug(slug)
  
  if (!post || post.status !== 'published') notFound()
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(post.markdown) }} />
    </article>
  )
}
```

---

## Sync to External CMSs

Publish once, sync everywhere:

```typescript
export const cms = createAutoblogger({
  // Built-in Prismic support
  prismic: {
    repository: 'your-repo',
    writeToken: process.env.PRISMIC_WRITE_TOKEN,
  },
  
  // Or custom destinations
  destinations: [myContentfulAdapter, mySanityAdapter],
  
  // Or webhooks
  webhooks: ['https://api.example.com/cms-webhook'],
})
```

📖 **[External CMS integration guide →](docs/GUIDE.md#external-cms-integration)**

---

## Requirements

- Next.js 14, 15, or 16 (App Router)
- Prisma 5 or 6
- Node.js 20+

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` | Open chat |
| `⌘⇧A` | Toggle Ask/Agent mode |
| `⌘S` | Save |
| `⌘.` | Toggle theme |
| `Esc` | Go back / Stop generation |

---

## Documentation

- 📖 **[Full Setup Guide](docs/GUIDE.md)** — Complete installation and configuration
- 🔧 **[Configuration Options](docs/GUIDE.md#configuration-options)** — All available settings
- 🔐 **[Authentication](docs/GUIDE.md#authentication)** — NextAuth, Clerk, custom auth
- 🎨 **[Styling](docs/GUIDE.md#styling)** — Customize the dashboard
- 🔌 **[CMS Integration](docs/GUIDE.md#external-cms-integration)** — Prismic, Contentful, Sanity
- 📡 **[Auto-Draft](docs/GUIDE.md#auto-draft-from-rss)** — Generate posts from RSS feeds

---

## License

MIT © [Hunter Rosenblume](https://github.com/hrosenblume)

---

<p align="center">
  <strong>Write faster. Publish more. Win at SEO.</strong>
  <br><br>
  <code>npx autoblogger init</code>
</p>
