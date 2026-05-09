# Autoblogger

AI-powered headless CMS SDK that embeds into Next.js host apps. Provides a writing dashboard at `/writer`, a session-authenticated internal API at `/api/cms/*`, and a bearer-token public API at `/writer/api/v1/*`. Ships prebuilt `dist/` (committed) so consumers install from GitHub and never need to rebuild.

**This file replaces `.cursor/rules/`.** No sensitive data here — no emails, URLs, passwords, API keys.

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Package manager | bun (`bun install`, `bun run build`, lockfile `bun.lock`) |
| Framework | Next.js 14/15/16 (App Router) |
| UI | React 18/19 |
| Database | Host app's Prisma client |
| Styling | Tailwind CSS (standalone CSS bundled) |
| Editor | Tiptap WYSIWYG with markdown sync |
| AI | Anthropic Claude, OpenAI GPT (with web search + thinking) |
| Build | tsup + Tailwind CLI |

## Project structure

```
src/
├── ai/                 # AI provider integrations
│   ├── provider.ts     # Streaming generate(), generateStream(), web search
│   ├── prompts/        # System prompts per mode (ask/agent/plan/generate/...)
│   ├── builders.ts     # Prompt builders that combine rules + templates + style
│   ├── chat.ts         # chatStream() multi-turn handler
│   ├── generate.ts     # generateStream() + expandPlanStream()
│   ├── edits.ts        # SHARED :::edit parser + applier (server + client)
│   ├── parse.ts        # parseGeneratedContent() title/subtitle/body splitter
│   └── models.ts       # Model registry, resolveModel()
├── api/                # Internal/dashboard API (session-auth)
│   ├── index.ts        # createAPIHandler() — main router
│   ├── posts.ts        # /posts CRUD + auto-revision on PATCH
│   ├── ai.ts           # /ai/{generate,chat,rewrite,settings}
│   ├── api-keys.ts     # /api-keys management (admin only, session-auth)
│   ├── settings.ts     # /settings + /settings/integrations
│   └── ...
├── api/public/         # Public API (bearer-auth)
│   ├── index.ts        # createPublicAPIHandler() with audit-log wrapper
│   ├── auth.ts         # bearer extraction + cms.apiKeys.verify()
│   ├── shared.ts       # collectStream(), parseListQuery, applyStatusTransition
│   ├── posts.ts        # /v1/posts/* (CRUD + every status transition)
│   ├── tags.ts         # /v1/tags
│   ├── revisions.ts    # /v1/revisions/:id + /v1/posts/:id/revisions
│   ├── topics.ts       # /v1/topics + /v1/auto-draft/run
│   ├── ai.ts           # /v1/ai/* + /v1/posts/:id/agent
│   └── me.ts           # /v1/me — auth health check
├── auto-draft/         # RSS feed processing
├── data/               # Thin Prisma wrappers
│   ├── api-keys.ts     # ApiKey CRUD + sha256 verify
│   ├── api-audit-log.ts # Append-only log writer + paginated reader
│   └── ...
├── destinations/       # External CMS adapters (Prismic, custom)
├── lib/                # Utilities (markdown, sse, storage, url-extractor)
├── types/              # Server-safe types (no React)
├── ui/                 # React dashboard
│   ├── pages/settings/ # Each setting card lives here; ApiKeysSettings.tsx is /writer/settings/api
│   ├── hooks/useChat.tsx # Chat state; imports parseEditBlocks from src/ai/edits.ts
│   ├── pages/EditorPage.tsx # handleEdit delegates to applyEdits in src/ai/edits.ts
│   └── ...
├── index.ts            # Server-safe exports (no React)
└── server.ts           # createAutoblogger() factory; exposes handleRequest + handlePublicRequest
```

## Public HTTP API surface (`/v1`)

Bearer-auth (`Authorization: Bearer ab_live_…`). Every call is logged in `ApiAuditLog`.

- **Auth**: `GET /v1/me`
- **Posts read**: `GET /v1/posts` (filters: `status`, `q`, `tag`, `topicId`, `since`, `until`, `sort`, `order`, `page`, `limit`, `include`); `/posts/:id`; `/posts/by-slug/:slug`; convenience `/posts/{drafts,published,suggested,trash,counts}`; `/posts/:id/revisions`
- **Posts write**: `POST /v1/posts`, `PATCH/PUT/DELETE /v1/posts/:id`, `POST /v1/posts/:id/{publish,unpublish,restore,approve,status,duplicate,preview-link,tags}`
- **Tags**: `GET/POST/PATCH/DELETE /v1/tags[/:id]`
- **Revisions**: `GET /v1/revisions/:id`, `POST /v1/revisions/:id/restore`
- **Topics + auto-draft**: `GET /v1/topics[/:id]`, `POST /v1/topics/:id/run`, `POST /v1/auto-draft/run`
- **AI**: `GET /v1/ai/{models,settings}`, `POST /v1/ai/{generate,generate/raw,plan,expand-plan,rewrite,chat,search}`
- **Agent edit**: `POST /v1/posts/:id/agent` — applies the model's `:::edit` blocks server-side via `src/ai/edits.ts`. Default `target` is `new-draft` when published, `in-place` when draft.

Internal key-management endpoints (session-auth, admin) are at `/api/cms/api-keys`. Settings UI: `/writer/settings/api`.

## DRY — single source of truth for `:::edit`

Both the dashboard's `useChat.tsx` (parser) and `EditorPage.handleEdit` (applier) and the public agent handler (`src/api/public/ai.ts`) import from **`src/ai/edits.ts`**. When changing `:::edit` semantics, edit only that file.

## Code conventions

### Server vs client split

- `src/index.ts` exports server-safe code only (no React imports)
- `src/ui/index.ts` exports React components
- Never import React in server files
- Types in `src/types/config.ts` must be server-safe (no `ComponentType`, etc.)

### TypeScript

- Strict mode; avoid `any` (use `unknown` + type guards). One unavoidable exception: the host's Prisma client is `unknown` to avoid peer-dep issues, so cast `config.prisma as any` once at the module boundary and never again.
- Explicit return types on exported functions.

### React

- Always `'use client'` on client components.
- Use `useCallback` for handlers passed to children.
- Local state for component-specific data; `DashboardContext` for cross-component shared state; `ChatContext` for chat-specific.

### Styling

- Tailwind only. Use `cn()` from `src/lib/cn`.
- Dark mode is `ab-dark:` (custom prefix, not Tailwind's `dark:`).
- Mobile-first; touch targets ≥ 44×44.

### API handlers

```typescript
export async function handlePostsAPI(
  req: NextRequest,
  cms: AutobloggerServer,
  session: Session | null,
  path: string
): Promise<Response> {
  const authError = requireAuth(session)
  if (authError) return authError
  // route by method + path...
}
```

Success: `jsonResponse({ data: result })`. Error: `jsonResponse({ error: 'Message' }, 400)`. List: `{ data, total, page, totalPages }`.

### AI / streaming

- SSE: `controller.enqueue(encoder.encode(\`data: ${JSON.stringify({ text })}\n\n\`))`. End: `data: [DONE]\n\n`.
- Always wrap `controller.enqueue` in a safe helper that returns false on closed.
- For sync collection of streams: use `collectStream` in `src/api/public/shared.ts`.

### Destinations

```typescript
const destination: Destination = {
  name: 'my-destination',
  async onPublish(post)   { return { success: true, externalId: 'doc-123' } },
  async onUnpublish(post) { return { success: true } },
  async onDelete(post)    { return { success: true } },
}
```

Destination calls are fire-and-forget — never block the main response. Use `.catch()` to log errors without throwing.

### Logging

```typescript
console.log('[Web Search] Fetching...')
console.error('[prismic:repo-name] Failed to sync:', error)
console.warn('[autoblogger] Feature not supported')
```

## Common gotchas

- **Hydration mismatches** — Use `immediatelyRender: false` for Tiptap.
- **Dark mode** — `ab-dark:`, not `dark:`.
- **SSE controller errors** — Always handle `controller.close()` / closed-controller cases.
- **Static graph + jsdom** — `url-extractor.ts` (which dynamically imports `jsdom`) is loaded via `await import()` from `src/ai/{generate,chat}.ts`. Don't change those to static imports — Next/webpack will follow into jsdom and choke on its `parse5` (ESM-only) require.
- **Stale closures in useEffect** — Include all referenced values in deps.

## Build, test, ship

- `bun run typecheck` — TypeScript only.
- `bun run build` — `tsup` compiles `dist/index.{js,mjs}` and `dist/ui.{js,mjs}`, plus tailwind preset and CSS. `dist/` is committed.
- After source changes, build before committing if consumers will install via GitHub.

## Release workflow

Releases are PR + auto-merge.

1. Branch off main: `git checkout -b release/<x.y.z>`.
2. Bump `version` in `package.json`.
3. `bun run build`.
4. Commit (include the rebuilt `dist/`), push branch.
5. `gh pr create` with title `chore: <x.y.z>`.
6. `gh pr merge --auto --squash --delete-branch`.
7. After merge, downstream consumers run `bun update autoblogger` to pull the new commit hash.

**Never push directly to main without a PR** unless explicitly authorized.

## Yalc / local dev

`yalc` linking is no longer required for normal development — consumers install via `github:hrosenblume/autoblogger` and pick up new commits with `bun update autoblogger`. If you ever do need yalc for an offline iteration loop, use `yalc link autoblogger` (NOT `yalc add` — that writes a `file:.yalc/...` reference into package.json which breaks production installs).

## Configuring autoblogger in a host app

```typescript
const cms = createAutoblogger({
  prisma,
  auth: {
    getSession: () => auth(),
    isAdmin: (s) => s?.user?.role === 'admin',
    canPublish: (s) => ['admin', 'writer'].includes(s?.user?.role),
  },
  ai: {
    anthropicKey: process.env.ANTHROPIC_API_KEY,
    openaiKey: process.env.OPENAI_API_KEY,
  },
  destinations: [...],
  webhooks: [...],
  hooks: { beforePublish, afterSave, onSlugChange },
})

// Mount internal API:
//   app/api/cms/[...path]/route.ts -> cms.handleRequest(req, path)
// Mount public API:
//   app/(dashboard)/writer/api/[...path]/route.ts -> cms.handlePublicRequest(req, path)
```
