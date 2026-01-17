# Autoblogger Setup Guide

Complete instructions for setting up Autoblogger in your Next.js app.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Manual Setup](#manual-setup)
- [Configuration Options](#configuration-options)
- [Authentication](#authentication)
- [AI Configuration](#ai-configuration)
- [Displaying Posts](#displaying-posts)
- [SEO & Metadata](#seo--metadata)
- [Custom Fields](#custom-fields)
- [Styling](#styling)
- [External CMS Integration](#external-cms-integration)
- [Auto-Draft from RSS](#auto-draft-from-rss)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before installing Autoblogger, you need:

- **Next.js 14, 15, or 16** with App Router
- **Prisma 5 or 6** configured in your project
- **Node.js 20+**

If you don't have Prisma set up yet:

```bash
npm install prisma @prisma/client
npx prisma init
```

---

## Installation

### Automatic Setup (Recommended)

The CLI handles everything for you:

```bash
npm install autoblogger
npx autoblogger init
```

The CLI will:
1. Detect your Next.js and Prisma configuration
2. Add the required models to your Prisma schema
3. Create `lib/cms.ts` with your configuration
4. Create the API route at `app/api/cms/[...path]/route.ts`
5. Create the dashboard at `app/(writer)/writer/page.tsx`
6. Add CSS imports to your `globals.css`
7. Run `prisma migrate dev` to update your database

### CLI Options

```bash
npx autoblogger init --yes        # Use defaults, no prompts
npx autoblogger init --dry-run    # Preview changes without applying
```

---

## Manual Setup

If you prefer to set things up manually:

### 1. Install the package

```bash
npm install autoblogger
```

### 2. Add Prisma models

Add these models to your `prisma/schema.prisma`:

```prisma
model Post {
  id          String    @id @default(uuid())
  title       String
  subtitle    String?
  slug        String    @unique
  markdown    String
  status      String    @default("draft")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  publishedAt DateTime?

  // SEO fields
  seoTitle       String?
  seoDescription String?
  seoKeywords    String?
  noIndex        Boolean  @default(false)
  ogImage        String?

  // Preview
  previewToken  String?   @unique
  previewExpiry DateTime?

  // Relations
  revisions Revision[]
  tags      PostTag[]
  comments  Comment[]

  // Auto-draft
  sourceUrl String?
  topicId   String?
  topic     TopicSubscription? @relation(fields: [topicId], references: [id])
}

model Revision {
  id        String   @id @default(uuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  title     String?
  subtitle  String?
  markdown  String
  createdAt DateTime @default(now())
}

model Comment {
  id         String    @id @default(uuid())
  postId     String
  post       Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  userId     String?
  user       User?     @relation(fields: [userId], references: [id])
  quotedText String    @default("")
  content    String
  parentId   String?
  parent     Comment?  @relation("Replies", fields: [parentId], references: [id], onDelete: Cascade)
  replies    Comment[] @relation("Replies")
  resolved   Boolean   @default(false)
  deletedAt  DateTime?
  approved   Boolean   @default(true)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@index([postId])
  @@index([parentId])
}

model User {
  id        String    @id @default(uuid())
  email     String    @unique
  name      String?
  role      String    @default("writer")
  createdAt DateTime  @default(now())
  comments  Comment[]
}

model Tag {
  id        String    @id @default(uuid())
  name      String    @unique
  createdAt DateTime  @default(now())
  posts     PostTag[]
}

model PostTag {
  id        String   @id @default(uuid())
  postId    String
  tagId     String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([postId, tagId])
}

model AISettings {
  id                 String   @id @default("default")
  rules              String   @default("")
  chatRules          String   @default("")
  rewriteRules       String?
  autoDraftRules     String?
  planRules          String?
  defaultModel       String   @default("claude-sonnet")
  autoDraftWordCount Int      @default(800)
  generateTemplate   String?
  chatTemplate       String?
  rewriteTemplate    String?
  autoDraftTemplate  String?
  planTemplate       String?
  expandPlanTemplate String?
  anthropicKey       String?
  openaiKey          String?
  updatedAt          DateTime @updatedAt
}

model IntegrationSettings {
  id               String   @id @default("default")
  autoDraftEnabled Boolean  @default(false)
  postUrlPattern   String   @default("/blog/{slug}")
  
  // Prismic Integration
  prismicEnabled      Boolean  @default(false)
  prismicRepository   String?
  prismicWriteToken   String?
  prismicDocumentType String   @default("autoblog")
  prismicSyncMode     String   @default("stub")
  prismicLocale       String   @default("en-us")
  prismicAutoRename   Boolean  @default(false)
  
  updatedAt DateTime @updatedAt
}

model TopicSubscription {
  id               String     @id @default(uuid())
  name             String
  keywords         String
  rssFeeds         String
  isActive         Boolean    @default(true)
  useKeywordFilter Boolean    @default(true)
  frequency        String     @default("daily")
  maxPerPeriod     Int        @default(3)
  essayFocus       String?
  lastRunAt        DateTime?
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
  posts            Post[]
  newsItems        NewsItem[]
}

model NewsItem {
  id          String             @id @default(uuid())
  topicId     String
  topic       TopicSubscription  @relation(fields: [topicId], references: [id], onDelete: Cascade)
  url         String             @unique
  title       String
  summary     String?
  publishedAt DateTime?
  status      String             @default("pending")
  postId      String?            @unique
  post        Post?              @relation(fields: [postId], references: [id])
  createdAt   DateTime           @default(now())
}
```

Run the migration:

```bash
npx prisma migrate dev --name add-autoblogger
```

### 3. Create the configuration

Create `lib/cms.ts`:

```typescript
import { createAutoblogger } from 'autoblogger'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'  // Your auth function

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

### 4. Create the API route

Create `app/api/cms/[...path]/route.ts`:

```typescript
import { cms } from '@/lib/cms'

export const dynamic = 'force-dynamic'

async function handler(req: Request) {
  const url = new URL(req.url)
  const path = url.pathname.replace('/api/cms', '')
  return cms.handleRequest(req, path)
}

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE }
```

### 5. Create the dashboard page

Create `app/(writer)/writer/[[...path]]/page.tsx`:

```typescript
import { cms } from '@/lib/cms'
import { AutobloggerDashboard } from 'autoblogger/ui'
import { redirect } from 'next/navigation'

export default async function WriterPage() {
  const session = await cms.config.auth.getSession()
  
  if (!session) {
    redirect('/auth/signin')
  }

  return (
    <AutobloggerDashboard
      session={session}
      basePath="/writer"
      apiBasePath="/api/cms"
    />
  )
}
```

### 6. Add styles

Add to your `app/globals.css`:

```css
@import 'autoblogger/styles/standalone.css';
```

### 7. Fix hydration warnings

Add `suppressHydrationWarning` to your root layout's `<html>` tag:

```tsx
<html lang="en" suppressHydrationWarning>
```

---

## Configuration Options

Full configuration reference:

```typescript
const cms = createAutoblogger({
  // Required: Your Prisma client
  prisma,

  // Required: Authentication
  auth: {
    getSession: () => auth(),
    isAdmin: (session) => session?.user?.role === 'admin',
    canPublish: (session) => ['admin', 'writer'].includes(session?.user?.role ?? ''),
  },

  // Optional: AI providers
  ai: {
    anthropicKey: process.env.ANTHROPIC_API_KEY,
    openaiKey: process.env.OPENAI_API_KEY,
  },

  // Optional: Prismic integration
  prismic: {
    repository: 'your-repo',
    writeToken: process.env.PRISMIC_WRITE_TOKEN,
  },

  // Optional: Custom destination adapters
  destinations: [myDestination],

  // Optional: Webhook URLs
  webhooks: ['https://api.example.com/webhook'],

  // Optional: Lifecycle hooks
  hooks: {
    beforePublish: async (post) => {
      // Validate before publishing
    },
    afterSave: async (post) => {
      // Trigger revalidation, etc.
    },
    onSlugChange: async ({ postId, oldSlug, newSlug }) => {
      // Create redirects
    },
  },

  // Optional: Event callbacks
  onPublish: async (post) => { },
  onUnpublish: async (post) => { },
  onDelete: async (post) => { },

  // Optional: Custom styles
  styles: {
    container: 'max-w-3xl mx-auto px-6',
    title: 'text-3xl font-bold',
    subtitle: 'text-xl text-gray-600',
    byline: 'text-sm text-gray-500',
    prose: 'prose prose-lg',
  },
})
```

---

## Authentication

Autoblogger works with any authentication system. You provide three functions:

### With NextAuth.js v5

```typescript
import { auth } from '@/auth'

auth: {
  getSession: () => auth(),
  isAdmin: (session) => session?.user?.role === 'admin',
  canPublish: (session) => ['admin', 'writer'].includes(session?.user?.role ?? ''),
}
```

### With Clerk

```typescript
import { currentUser } from '@clerk/nextjs/server'

auth: {
  getSession: async () => {
    const user = await currentUser()
    return user ? { user: { email: user.emailAddresses[0]?.emailAddress, role: user.publicMetadata.role } } : null
  },
  isAdmin: (session) => session?.user?.role === 'admin',
  canPublish: (session) => !!session,
}
```

### User Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access: publish, settings, user management |
| `writer` | Can create, edit, and publish posts |
| `drafter` | Can create and edit drafts, cannot publish |

---

## AI Configuration

### Environment Variables

```env
ANTHROPIC_API_KEY="sk-ant-..."  # Required for Claude models
OPENAI_API_KEY="sk-..."         # Required for GPT models
```

### Available Models

| Model ID | Provider | Best For |
|----------|----------|----------|
| `claude-sonnet` | Anthropic | General writing (default) |
| `claude-opus` | Anthropic | Complex, nuanced content |
| `claude-haiku` | Anthropic | Quick drafts |
| `gpt-4o` | OpenAI | Versatile writing |
| `gpt-4o-mini` | OpenAI | Fast, economical |
| `o1` | OpenAI | Deep reasoning |

### Customizing AI Behavior

Visit `/writer/settings/ai` to customize:
- System prompts for generation
- Chat behavior rules
- Default word counts
- Model preferences

---

## Displaying Posts

### List all published posts

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
          <p>{post.subtitle}</p>
        </li>
      ))}
    </ul>
  )
}
```

### Display a single post

```typescript
// app/blog/[slug]/page.tsx
import { cms } from '@/lib/cms'
import { renderMarkdown } from 'autoblogger/markdown'
import { notFound } from 'next/navigation'

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await cms.posts.findBySlug(slug)
  
  if (!post || post.status !== 'published') {
    notFound()
  }
  
  return (
    <article>
      <h1>{post.title}</h1>
      {post.subtitle && <p>{post.subtitle}</p>}
      <div 
        className="prose"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(post.markdown) }} 
      />
    </article>
  )
}
```

### Generate static paths

```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await cms.posts.findPublished()
  return posts.map(post => ({ slug: post.slug }))
}
```

---

## SEO & Metadata

### Generate metadata for posts

```typescript
// app/blog/[slug]/page.tsx
import { cms } from '@/lib/cms'
import { getSeoValues } from 'autoblogger/seo'
import type { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params
  const post = await cms.posts.findBySlug(slug)
  
  if (!post) return {}
  
  const seo = getSeoValues(post)
  
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      title: seo.title,
      description: seo.description,
      images: seo.ogImage ? [seo.ogImage] : [],
    },
    robots: post.noIndex ? { index: false } : undefined,
  }
}
```

The `getSeoValues()` helper returns SEO fields with fallbacks to post title/subtitle.

---

## Custom Fields

Add custom fields to the editor:

```typescript
// lib/cms.ts
import { createAutoblogger, type CustomFieldConfig } from 'autoblogger'

const categoryField: CustomFieldConfig = {
  name: 'category',
  label: 'Category',
  position: 'footer',
  component: ({ value, onChange, disabled }) => (
    <select 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
    >
      <option value="">Select category</option>
      <option value="tech">Tech</option>
      <option value="life">Life</option>
    </select>
  ),
}

export const cms = createAutoblogger({
  // ... other config
  fields: [categoryField],
})
```

Don't forget to add the field to your Prisma schema:

```prisma
model Post {
  // ... existing fields
  category String?
}
```

---

## Styling

### Standalone CSS (No Tailwind Required)

Autoblogger includes complete standalone CSS:

```css
/* app/globals.css */
@import 'autoblogger/styles/standalone.css';
```

### With Tailwind (Custom Theme)

If you use Tailwind and want autoblogger to inherit your theme:

```javascript
// tailwind.config.js
module.exports = {
  presets: [require('autoblogger/styles/preset')],
  content: [
    // your paths...
    './node_modules/autoblogger/dist/**/*.{js,mjs}',
  ],
}
```

Then import base styles:

```css
@import 'autoblogger/styles/autoblogger.css';
```

---

## External CMS Integration

### Prismic

1. Configure in your cms.ts:

```typescript
export const cms = createAutoblogger({
  prismic: {
    repository: 'your-repo',
    writeToken: process.env.PRISMIC_WRITE_TOKEN,
  },
})
```

2. Enable in Settings → CMS Integrations → Prismic

3. Choose sync mode:
   - **Stub**: Only syncs slug as UID (content lives in autoblogger)
   - **Full**: Syncs complete content as rich text

### Custom Destinations

Build adapters for any CMS:

```typescript
import type { Destination } from 'autoblogger'

const contentfulDestination: Destination = {
  name: 'contentful',
  
  async onPublish(post) {
    const entry = await contentful.createEntry('blogPost', {
      fields: {
        title: { 'en-US': post.title },
        slug: { 'en-US': post.slug },
        body: { 'en-US': post.markdown },
      },
    })
    await contentful.publishEntry(entry.sys.id)
    return { success: true, externalId: entry.sys.id }
  },
  
  async onUnpublish(post) {
    await contentful.unpublishEntry(post.externalId)
    return { success: true }
  },
  
  async onDelete(post) {
    await contentful.deleteEntry(post.externalId)
    return { success: true }
  },
}
```

### Rich Text Converters

Convert markdown to CMS-specific formats:

```typescript
import { 
  markdownToPrismicRichText,
  markdownToContentfulRichText,
  markdownToPortableText,  // Sanity
} from 'autoblogger/rich-text'

const prismicContent = markdownToPrismicRichText(post.markdown)
const contentfulContent = markdownToContentfulRichText(post.markdown)
const sanityContent = markdownToPortableText(post.markdown)
```

---

## Auto-Draft from RSS

Automatically generate draft posts from RSS feeds:

### 1. Enable auto-draft

Go to Settings → General and enable "Auto-Draft".

### 2. Create topic subscriptions

Go to Settings → Topics and create a subscription:
- **Name**: "Tech News"
- **RSS Feeds**: `https://news.ycombinator.com/rss`
- **Keywords**: `AI, machine learning, startups`
- **Frequency**: Daily
- **Max per period**: 3

### 3. Run auto-draft

Programmatically:

```typescript
import { cms } from '@/lib/cms'

// Run for all topics
await cms.autoDraft.run()

// Run for specific topic
await cms.autoDraft.run('topic-id')
```

Via cron job (e.g., Vercel Cron):

```typescript
// app/api/cron/auto-draft/route.ts
import { cms } from '@/lib/cms'

export async function GET() {
  const results = await cms.autoDraft.run()
  return Response.json({ generated: results.length })
}
```

---

## Troubleshooting

### AI not working

Check your environment variables:
```bash
echo $ANTHROPIC_API_KEY
echo $OPENAI_API_KEY
```

### Hydration warnings

Add `suppressHydrationWarning` to your `<html>` tag:
```tsx
<html lang="en" suppressHydrationWarning>
```

### Styles not loading

Make sure you imported the CSS:
```css
@import 'autoblogger/styles/standalone.css';
```

### Dashboard 404

Check that your route is set up correctly:
- File: `app/(writer)/writer/[[...path]]/page.tsx`
- The `[[...path]]` catches all sub-routes

### Database errors

Run migrations:
```bash
npx prisma migrate dev
```

### TypeScript errors

Run type check:
```bash
npm run typecheck
```

---

## Getting Help

- [GitHub Issues](https://github.com/hrosenblume/autoblogger/issues)
- [npm Package](https://www.npmjs.com/package/autoblogger)
