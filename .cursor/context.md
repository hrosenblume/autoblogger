# Autoblogger - Project Context

## What is Autoblogger?

Autoblogger is an AI-powered headless CMS that embeds into Next.js applications. It provides a complete writing environment with AI assistance, letting users generate, edit, and publish blog posts without leaving their app.

## Core Value Proposition

- **Embedded CMS**: Runs inside the host app at `/writer`, not a separate service
- **AI-First**: Claude and GPT integration for generating essays, editing, and chat
- **Flexible Publishing**: Posts live in the host app's database, can sync to external CMSs

## Architecture Overview

### How It Works

1. **Host app installs autoblogger** via npm
2. **CLI (`npx autoblogger init`)** adds Prisma models and creates routes
3. **Dashboard renders at `/writer`** using the host app's auth and database
4. **API routes handle CRUD** at `/api/cms/*`
5. **Posts sync to external CMSs** (Prismic, Contentful, etc.) on publish

### Package Structure

```
src/
├── ai/                 # AI provider integrations
│   ├── provider.ts     # Anthropic/OpenAI streaming, web search
│   ├── prompts.ts      # System prompts for each mode
│   ├── models.ts       # Model definitions and configuration
│   └── chat.ts         # Chat API handler
├── api/                # API route handlers
│   ├── posts.ts        # CRUD for posts
│   ├── ai.ts           # AI generation endpoints
│   ├── settings.ts     # Settings (general + integrations)
│   └── ...
├── auto-draft/         # RSS feed processing
│   ├── rss.ts          # Feed fetching and parsing
│   ├── runner.ts       # Auto-draft generation logic
│   └── keywords.ts     # Keyword filtering
├── cli/                # `npx autoblogger` commands
│   ├── init.ts         # Project setup wizard
│   └── import.ts       # Markdown file importer
├── data/               # Database access layer
│   ├── posts.ts        # Post queries with destination firing
│   ├── factory.ts      # Generic CRUD factory
│   └── ...
├── destinations/       # External CMS adapters
│   ├── dispatcher.ts   # Manages multiple destinations
│   └── prismic.ts      # Prismic adapter
├── lib/                # Utilities
│   ├── markdown.ts     # Markdown ↔ HTML conversion
│   ├── rich-text.ts    # Markdown → Prismic/Contentful/Sanity
│   ├── comments.ts     # Comment utilities
│   └── ...
├── types/              # TypeScript types
│   ├── config.ts       # Server config (no React)
│   ├── destinations.ts # Destination adapter types
│   └── models.ts       # Database model types
├── ui/                 # React components
│   ├── components/     # Reusable UI components
│   ├── pages/          # Full page components
│   ├── hooks/          # React hooks (useChat, useComments)
│   └── context.tsx     # Dashboard context provider
├── index.ts            # Server exports (no React)
├── server.ts           # createAutoblogger() factory
└── config.ts           # Configuration types

packages/
└── prismic/            # @autoblogger/prismic package
```

### Key Files

| File | Purpose |
|------|---------|
| `src/server.ts` | Creates the autoblogger instance with all data accessors |
| `src/api/index.ts` | Main API router that delegates to handlers |
| `src/data/posts.ts` | Post CRUD with destination dispatch logic |
| `src/destinations/dispatcher.ts` | Fires events to all configured destinations |
| `src/ai/provider.ts` | Streaming responses from Claude/GPT, web search |
| `src/ui/pages/EditorPage.tsx` | Main essay editor with AI integration |
| `src/ui/hooks/useChat.ts` | Chat state management and AI communication |

## Data Flow

### Publishing a Post

```
User clicks "Publish"
    ↓
EditorPage calls PATCH /api/cms/posts/:id { status: 'published' }
    ↓
API handler calls cms.posts.update()
    ↓
posts.ts detects status change to 'published'
    ↓
Fires dispatcher.publish(post) for code-configured destinations
    ↓
Fires fireDynamicPrismicDestination() for DB-configured Prismic
    ↓
Each destination's onPublish() is called
    ↓
Prismic adapter creates/updates document via Migration API
```

### AI Chat Flow

```
User sends message in ChatPanel
    ↓
useChat hook calls POST /api/cms/ai/chat
    ↓
API builds prompt with essay context + mode (ask/agent/plan)
    ↓
If web search enabled, fetches search results first (OpenAI Responses API)
    ↓
Streams response via SSE
    ↓
ChatPanel updates messages state in real-time
    ↓
If agent mode, parses edit commands and applies to editor
```

## Database Models

The key models (defined in host app's Prisma schema):

- **Post**: Main content with title, slug, markdown, status, SEO fields
- **Revision**: Saved snapshots of post content
- **Comment**: Inline comments on posts (threaded)
- **Tag/PostTag**: Categorization
- **AISettings**: Model preferences, templates, rules
- **IntegrationSettings**: External CMS configuration (Prismic, etc.)
- **TopicSubscription**: RSS feed subscriptions for auto-draft
- **NewsItem**: Individual RSS items for processing

## Configuration

Host apps configure autoblogger via `createAutoblogger()`:

```typescript
const cms = createAutoblogger({
  prisma,                           // Host app's Prisma client
  auth: {
    getSession: () => auth(),       // Auth function
    isAdmin: (s) => s?.user?.role === 'admin',
    canPublish: (s) => ['admin', 'writer'].includes(s?.user?.role),
  },
  ai: {
    anthropicKey: process.env.ANTHROPIC_API_KEY,
    openaiKey: process.env.OPENAI_API_KEY,
  },
  prismic: {                        // Optional: Prismic config
    repository: 'my-repo',
    writeToken: process.env.PRISMIC_WRITE_TOKEN,
  },
  destinations: [myAdapter],        // Optional: Custom destinations
  webhooks: ['https://...'],        // Optional: Webhook URLs
  hooks: {
    beforePublish: async (post) => {},
    afterSave: async (post) => {},
    onSlugChange: async ({ oldSlug, newSlug }) => {},
  },
})
```

## Destinations System

### How It Works

1. **Code-configured destinations**: Passed via `config.destinations[]`, fire on every content change
2. **Dynamic destinations**: Configured via Settings UI, stored in `IntegrationSettings`
3. **Webhooks**: Simple POST to URLs with event payload

### Destination Interface

```typescript
interface Destination {
  name: string
  onPublish(post: Post): Promise<DestinationResult>
  onUnpublish(post: Post): Promise<DestinationResult>
  onDelete(post: Post): Promise<DestinationResult>
}
```

### Prismic Sync Modes

- **Stub mode**: Only syncs UID (slug). Content lives in autoblogger, Prismic just has references for collection slices.
- **Full mode**: Syncs complete content as Prismic rich text (for when Prismic is the content source of truth).

## AI Features

### Chat Modes

| Mode | Purpose | Prompt Strategy |
|------|---------|-----------------|
| Ask | Q&A about essay | System prompt includes full essay, expects conversational response |
| Agent | Direct editing | System prompt instructs to output JSON edit commands |
| Plan | Outline generation | Generates structured outline that can be expanded |

### Web Search

Uses OpenAI's Responses API with `web_search` tool. For Anthropic models, we:
1. Extract the query from user message
2. Call OpenAI Responses API to get search results
3. Include results in the context for Claude

### Thinking Mode

Extended thinking for Claude models. Adds `thinking: { type: 'enabled', budget_tokens: 10000 }` to the API call.

## UI Architecture

### Component Hierarchy

```
AutobloggerDashboard
└── DashboardProvider (context)
    └── DashboardLayout
        ├── Navbar
        ├── ChatProvider (optional)
        │   └── ChatPanel
        └── Router
            ├── WriterDashboard (/)
            ├── EditorPage (/editor/:slug?)
            └── SettingsPage (/settings/*)
```

### State Management

- **DashboardContext**: Navigation, session, shared data, styles
- **ChatContext**: Messages, streaming state, mode, model selection
- **EditorPage local state**: Post content, saving state, revisions

## Build System

- **tsup**: Bundles TypeScript → JS/MJS with declarations
- **Tailwind**: Generates standalone CSS (no Tailwind required in host app)
- **Exports**: Separate `index.ts` (server-safe) and `ui/index.ts` (React)

```bash
npm run build      # Full build
npm run dev        # Watch mode
npm run yalc:push  # Push to local yalc for testing
```

## Testing Changes

1. Make changes in autoblogger
2. Run `npm run build`
3. Run `yalc push`
4. In host app: `yalc link autoblogger`
5. Test the changes in host app

## Current Version: 0.2.7

Recent additions:
- Prismic integration with Settings UI
- Destinations adapter system
- Rich text converters (Prismic, Contentful, Sanity)
- Web search via OpenAI Responses API
- Extended thinking for Claude
- Post URL pattern configuration
- Mobile UX improvements
