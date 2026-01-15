# Autoblogger

[![npm version](https://img.shields.io/npm/v/autoblogger.svg)](https://www.npmjs.com/package/autoblogger)
[![license](https://img.shields.io/npm/l/autoblogger.svg)](https://github.com/hrosenblume/autoblogger/blob/main/LICENSE)

A complete content management system that embeds into your Next.js app. Write blog posts with AI assistance, manage revisions, handle comments, and auto-generate drafts from RSS feeds—all from a dashboard that lives inside your existing application.

```bash
npm install autoblogger
```

---

## What is Autoblogger?

Autoblogger is an **embeddable CMS package**. Instead of running a separate blog platform like WordPress or Ghost, you install Autoblogger as an npm package and mount it inside your Next.js app. It becomes part of your application—using your database, your auth system, and your hosting.

**This is not a standalone application.** It's a library that provides:

1. **A React dashboard** — A full writer/admin interface you mount at a route like `/writer`
2. **API handlers** — RESTful endpoints you mount at a route like `/api/cms`
3. **Data utilities** — Functions to query posts, render markdown, generate SEO metadata

You keep full control. Autoblogger uses your Prisma client, respects your auth, and stores everything in your database.

---

## Who is this for?

- **Developers building blogs** who want a writing dashboard without building one from scratch
- **Teams** who need collaborative editing with comments and revision history
- **AI-assisted writers** who want to generate drafts with Claude or GPT
- **Content aggregators** who want to auto-draft posts from RSS feeds

---

## Features

| Feature | Description |
|---------|-------------|
| **AI Writing** | Generate essays with Claude or GPT. Stream responses in real-time. Multiple chat modes for different workflows. |
| **AI Chat Modes** | **Ask** for Q&A, **Agent** for direct editing, **Plan** for outlines. Toggle web search and thinking mode. |
| **WYSIWYG Editor** | Tiptap-based editor with formatting toolbar. Syncs to markdown for storage. |
| **Revision History** | Every save creates a revision. Browse and restore any previous version. |
| **Inline Comments** | Highlight text and leave comments. Reply in threads. Resolve when done. |
| **RSS Auto-Draft** | Subscribe to RSS feeds. Filter articles by keywords. Auto-generate draft posts from news. |
| **Tag Management** | Organize posts with tags. Bulk edit from the settings panel. |
| **User Roles** | Admin, writer, and drafter roles with different permissions. |
| **SEO Fields** | Custom title, description, keywords, and OG image per post. |
| **Preview Links** | Generate expiring preview URLs for unpublished drafts. |

---

## Requirements

Before installing, make sure you have:

- **Next.js 14 or 15** (App Router)
- **React 18 or 19**
- **Prisma 5 or 6** with a configured database
- **Node.js 20+**

You'll also need API keys if you want AI features:

- **Anthropic API key** for Claude models
- **OpenAI API key** for GPT models

---

## Installation

### Quick Start (CLI)

The fastest way to set up Autoblogger is with the CLI:

```bash
npx autoblogger init
```

This command will:

1. Detect your Next.js project and Prisma setup
2. Merge the required models into your Prisma schema
3. Create boilerplate files (`lib/cms.ts`, API route, dashboard page)
4. Patch your Tailwind config to include Autoblogger's components
5. Run the database migration
6. Optionally import existing markdown content

**CLI Options:**

```bash
npx autoblogger init --yes           # Skip prompts, use defaults
npx autoblogger init --dry-run       # Preview changes without writing files
npx autoblogger init --skip-migrate  # Skip database migration
npx autoblogger init --import=./posts  # Import content after setup
```

**Import Existing Content:**

If you have markdown or MDX files, import them into the database:

```bash
npx autoblogger import ./content/posts
npx autoblogger import ./posts --status=published  # Import as published
npx autoblogger import ./posts --tag=imported      # Add a tag to all
```

### Manual Installation

If you prefer to set things up manually:

#### Step 1: Install the package

```bash
npm install autoblogger
```

This installs Autoblogger and its dependencies (Tiptap editor, AI SDKs, markdown utilities).

#### Step 2: Add the database models

Autoblogger needs several tables in your database. Copy the models from the package's schema file into your own Prisma schema.

**Option A: Copy the file and merge manually**

```bash
# View the schema
cat node_modules/autoblogger/prisma/schema.prisma
```

Then copy the models (Post, Revision, Comment, User, Tag, etc.) into your `prisma/schema.prisma`.

**Option B: If starting fresh, use it directly**

```bash
cp node_modules/autoblogger/prisma/schema.prisma ./prisma/schema.prisma
```

The required models are:

| Model | Purpose |
|-------|---------|
| `Post` | Blog posts with title, markdown content, status, SEO fields |
| `Revision` | Version history for posts |
| `Comment` | Inline editor comments with threading |
| `User` | CMS users with roles (admin, writer, drafter) |
| `Tag` | Tags for organizing posts |
| `PostTag` | Many-to-many relation between posts and tags |
| `AISettings` | AI model preferences and prompt templates |
| `IntegrationSettings` | Feature flags like auto-draft enabled |
| `TopicSubscription` | RSS feed subscriptions for auto-drafting |
| `NewsItem` | Individual RSS items fetched from subscriptions |
| `ChatMessage` | Persistent chat history for AI conversations |

#### Step 3: Run the migration

After adding the models to your schema:

```bash
npx prisma migrate dev --name add-autoblogger
```

This creates the tables in your database.

#### Step 4: Generate the Prisma client

```bash
npx prisma generate
```

---

## Configuration

Create a configuration file that sets up Autoblogger with your app's Prisma client and auth:

```typescript
// lib/cms.ts
import { createAutoblogger } from 'autoblogger'
import { prisma } from '@/lib/db'       // Your Prisma client
import { auth } from '@/lib/auth'       // Your auth function (e.g., NextAuth)

export const cms = createAutoblogger({
  // Required: Your Prisma client instance
  prisma,
  
  // Required: Authentication configuration
  auth: {
    // Function that returns the current session/user
    getSession: () => auth(),
    
    // Check if user is an admin (can access settings, manage users)
    isAdmin: (session) => session?.user?.role === 'admin',
    
    // Check if user can publish posts (admins and writers can, drafters can't)
    canPublish: (session) => ['admin', 'writer'].includes(session?.user?.role ?? ''),
  },
  
  // Optional: AI configuration
  ai: {
    anthropicKey: process.env.ANTHROPIC_API_KEY,
    openaiKey: process.env.OPENAI_API_KEY,
  },
  
  // Optional: File upload handler
  storage: {
    upload: async (file: File) => {
      // Implement your upload logic here (S3, Cloudflare R2, Vercel Blob, etc.)
      // Return an object with the public URL
      const url = await uploadToYourStorage(file)
      return { url }
    }
  },
})
```

### Environment Variables

Add these to your `.env.local`:

```bash
# Database (you probably already have this)
DATABASE_URL="postgresql://..."

# AI API keys (optional, only needed for AI features)
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."
```

---

## Mounting the API

Autoblogger needs API routes to handle requests from the dashboard. Create a catch-all route:

```typescript
// app/api/cms/[...path]/route.ts
import { cms } from '@/lib/cms'
import { NextRequest } from 'next/server'

async function handler(
  req: NextRequest, 
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return cms.handleRequest(req, path.join('/'))
}

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE }
```

This single file handles all CMS API routes:

| Route | Purpose |
|-------|---------|
| `GET /api/cms/posts` | List all posts |
| `POST /api/cms/posts` | Create a new post |
| `PATCH /api/cms/posts/:id` | Update a post |
| `DELETE /api/cms/posts/:id` | Delete a post |
| `GET /api/cms/revisions` | List revisions |
| `POST /api/cms/revisions/:id/restore` | Restore a revision |
| `GET /api/cms/comments` | List comments |
| `POST /api/cms/ai/generate` | Generate essay with AI (streaming SSE) |
| `POST /api/cms/ai/chat` | Chat with AI (streaming, supports modes) |
| `GET /api/cms/chat/history` | Get persisted chat history |
| `POST /api/cms/chat/history` | Save chat message |
| ... | And more |

---

## Mounting the Dashboard

The dashboard is a React component that renders the full CMS interface. Mount it at a route in your app:

```typescript
// app/writer/[[...path]]/page.tsx
import { AutobloggerDashboard } from 'autoblogger/ui'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function WriterPage({ 
  params 
}: { 
  params: Promise<{ path?: string[] }> 
}) {
  // Protect this route - only authenticated users
  const session = await auth()
  if (!session) {
    redirect('/login')
  }
  
  const { path } = await params
  
  return (
    <AutobloggerDashboard 
      apiBasePath="/api/cms"
      session={session}
      path={path?.join('/') || ''}
    />
  )
}
```

The `[[...path]]` syntax is a catch-all route that captures the dashboard's internal navigation:

| URL | Dashboard Page |
|-----|----------------|
| `/writer` | Post list (drafts, published, suggested) |
| `/writer/editor/my-post-slug` | Edit a specific post |
| `/writer/settings` | Settings overview |
| `/writer/settings/ai` | AI model and prompt configuration |
| `/writer/settings/users` | User management |
| `/writer/settings/tags` | Tag management |
| `/writer/settings/topics` | RSS topic subscriptions |

---

## Configuring Tailwind

Autoblogger's UI uses Tailwind CSS. Add the package's files to your Tailwind content configuration so the classes aren't purged:

```javascript
// tailwind.config.js
module.exports = {
  presets: [require('autoblogger/styles/preset')],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    // Add this line to include Autoblogger's components
    './node_modules/autoblogger/dist/**/*.{js,mjs}',
  ],
  darkMode: 'class',
  // ... rest of your config
}
```

The `autoblogger/styles/preset` includes:
- Typography scale (`text-title`, `text-h1`, `text-h2`, `text-h3`, `text-body`, `text-table`)
- Color tokens (`bg-background`, `text-muted-foreground`, `border-border`, etc.)
- Border radius utilities

---

## Styling

Autoblogger includes a complete theme with CSS variables, prose styles, and editor styling. Import it in your global CSS:

```css
/* app/globals.css */
@import 'autoblogger/styles/autoblogger.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

This provides:
- **Light and dark mode colors** — shadcn/ui Zinc theme tokens
- **Typography scale** — Consistent heading and body sizes  
- **Prose styles** — Article content formatting (headings, paragraphs, lists, code, blockquotes)
- **Editor styles** — Tiptap focus states and placeholder styling
- **Animations** — Fade-in effects with reduced motion support

### Customizing

Override any CSS variable after the import:

```css
@import 'autoblogger/styles/autoblogger.css';

:root {
  --primary: 221 83% 53%;  /* Custom blue primary */
}
```

Or pass custom styles when creating the CMS:

```typescript
// lib/cms.ts
export const cms = createAutoblogger({
  // ... other config
  styles: {
    container: 'max-w-3xl mx-auto px-8',
    title: 'text-4xl font-serif',
    prose: 'prose prose-lg dark:prose-invert',
  },
})
```

---

## Displaying Posts on Your Site

Use the CMS data layer to fetch posts for your public pages:

```typescript
// app/blog/page.tsx
import { cms } from '@/lib/cms'
import Link from 'next/link'

export default async function BlogPage() {
  const { posts } = await cms.data.posts.findAll({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
    take: 20,
  })
  
  return (
    <div>
      <h1>Blog</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <Link href={`/blog/${post.slug}`}>
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Rendering a Single Post

```typescript
// app/blog/[slug]/page.tsx
import { cms } from '@/lib/cms'
import { renderMarkdown } from 'autoblogger/markdown'
import { generateSeoMetadata } from 'autoblogger/seo'
import { notFound } from 'next/navigation'

export default async function PostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const post = await cms.data.posts.findBySlug(slug)
  
  if (!post || post.status !== 'published') {
    notFound()
  }
  
  const html = renderMarkdown(post.markdown)
  
  return (
    <article>
      <h1>{post.title}</h1>
      {post.subtitle && <p className="text-xl text-gray-600">{post.subtitle}</p>}
      <div 
        className="prose dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: html }} 
      />
    </article>
  )
}

// Generate SEO metadata
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params
  const post = await cms.data.posts.findBySlug(slug)
  
  if (!post) return {}
  
  return generateSeoMetadata(post)
}
```

---

## Package Exports

Autoblogger provides several entry points:

```typescript
// Main entry — server-side data layer and API handlers
import { createAutoblogger } from 'autoblogger'

// UI components — React dashboard (client-side)
import { AutobloggerDashboard } from 'autoblogger/ui'

// Chat components — for custom integrations
import { ChatProvider, useChatContext, ChatPanel, ChatButton } from 'autoblogger/ui'

// Markdown utilities — render markdown to HTML, parse HTML to markdown
import { renderMarkdown, parseMarkdown, htmlToMarkdown, markdownToHtml } from 'autoblogger/markdown'

// SEO utilities — generate meta tags from post data
import { getSeoValues } from 'autoblogger/seo'

// Article styles — CSS class helpers for consistent article layout
import { ARTICLE_STYLES } from 'autoblogger/styles/article'

// Auto-draft — generate posts from RSS feeds
import { runAutoDraft, fetchRssFeeds, filterByKeywords } from 'autoblogger'
```

---

## CLI Reference

Autoblogger includes a CLI for project setup and content management.

### Commands

| Command | Description |
|---------|-------------|
| `npx autoblogger init` | Set up Autoblogger in your Next.js project |
| `npx autoblogger import <path>` | Import markdown/MDX content into the database |

### Init Options

| Option | Description |
|--------|-------------|
| `--yes`, `-y` | Skip prompts and use defaults |
| `--skip-migrate` | Don't run database migration |
| `--import=<path>` | Import content from specified path after setup |
| `--dry-run` | Show what would be done without making changes |

### Import Options

| Option | Description |
|--------|-------------|
| `--status=<status>` | Set imported posts status (`draft` or `published`) |
| `--tag=<tag>` | Add a tag to all imported posts |
| `--dry-run` | Show what would be imported without making changes |

---

## AI Models

Autoblogger supports these AI models out of the box:

| ID | Name | Provider | Description |
|----|------|----------|-------------|
| `claude-sonnet` | Sonnet 4.5 | Anthropic | Fast, capable, best value |
| `claude-opus` | Opus 4.5 | Anthropic | Highest quality, slower |
| `gpt-5.2` | GPT-5.2 | OpenAI | Latest OpenAI flagship, native web search |
| `gpt-5-mini` | GPT-5 Mini | OpenAI | Fast and cost-efficient, native web search |

### Chat Modes

The AI chat panel supports multiple modes for different workflows:

| Mode | Description |
|------|-------------|
| **Ask** | Default mode. Ask questions, get feedback, discuss ideas. |
| **Agent** | Direct editing mode. AI outputs edit commands that are applied to your essay automatically. |
| **Plan** | Outline mode. AI generates structured outlines with sections and bullet points. Click "Draft Essay" to expand into a full essay. |

Toggle modes with the dropdown in the chat panel or use **⌘⇧A** (Cmd+Shift+A) to switch between Ask and Agent modes.

### AI Features

- **Web Search**: Toggle the globe icon to enable web search. Works with all models—GPT models use native tools, Claude uses a 2-call flow.
- **Thinking Mode**: Toggle the brain icon to enable extended thinking for complex reasoning tasks.
- **URL Context**: Paste a URL into your prompt and the AI will fetch and read the article content.
- **Custom Prompts**: Configure prompt templates for generation, chat, rewrite, plan, and auto-draft in **Settings → AI**.
- **Chat History**: Conversations are persisted across sessions.

Configure the default model and custom prompts in the dashboard under **Settings → AI**.

---

## User Roles

Autoblogger supports three roles:

| Role | Permissions |
|------|-------------|
| `admin` | Full access. Manage users, settings, publish/delete any post. |
| `writer` | Create posts, publish their own posts, edit drafts. |
| `drafter` | Create drafts only. Cannot publish. |

Roles are stored in the `User.role` field. Your auth configuration determines how roles are checked.

---

## Troubleshooting

### "Cannot find module 'autoblogger/ui'"

Make sure you're importing from the correct path and that the package is installed:

```bash
npm install autoblogger
```

### Tailwind classes not applying

Add the package to your Tailwind content config:

```javascript
content: [
  // ... your files
  './node_modules/autoblogger/dist/**/*.{js,mjs}',
]
```

### AI features not working

Check that your API keys are set in environment variables:

```bash
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."
```

And that you're passing them in the config:

```typescript
ai: {
  anthropicKey: process.env.ANTHROPIC_API_KEY,
  openaiKey: process.env.OPENAI_API_KEY,
}
```

### Database errors

Make sure you've:
1. Added all required models to your Prisma schema
2. Run `npx prisma migrate dev`
3. Run `npx prisma generate`

---

## License

MIT © [Hunter Rosenblume](https://github.com/hrosenblume)
