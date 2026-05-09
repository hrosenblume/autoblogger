// Server-safe exports - no React imports
import { createPostsData } from './data/posts'
import { createCommentsData } from './data/comments'
import { createTagsData } from './data/tags'
import { createRevisionsData } from './data/revisions'
import { createAISettingsData } from './data/ai-settings'
import { createTopicsData } from './data/topics'
import { createNewsItemsData } from './data/news-items'
import { createUsersData } from './data/users'
import { createApiKeysData } from './data/api-keys'
import { createApiAuditLogData } from './data/api-audit-log'
import { createAPIHandler } from './api'
import { createPublicAPIHandler } from './api/public'
import { runAutoDraft as runAutoDraftInternal, type AutoDraftConfig } from './auto-draft'
import { createDestinationDispatcher } from './destinations'
import { createStorageHandler } from './lib/storage'
import type { AutobloggerServerConfig, StylesConfig } from './types/config'
import { DEFAULT_STYLES } from './types/config'

// Re-export types for backward compatibility
export type { Session } from './types/session'
export type { StylesConfig, AutobloggerServerConfig } from './types/config'

// Autoblogger server instance type
export interface AutobloggerServer {
  config: AutobloggerServerConfig & { styles: Required<StylesConfig> }
  posts: ReturnType<typeof createPostsData>
  comments: ReturnType<typeof createCommentsData>
  tags: ReturnType<typeof createTagsData>
  revisions: ReturnType<typeof createRevisionsData>
  aiSettings: ReturnType<typeof createAISettingsData>
  topics: ReturnType<typeof createTopicsData>
  newsItems: ReturnType<typeof createNewsItemsData>
  users: ReturnType<typeof createUsersData>
  apiKeys: ReturnType<typeof createApiKeysData>
  apiAuditLog: ReturnType<typeof createApiAuditLogData>
  /** Handle an internal/dashboard API request - convenience method for route handlers */
  handleRequest: (req: Request, path: string) => Promise<Response>
  /** Handle a public/external API request (bearer-token auth, /v1/*) */
  handlePublicRequest: (req: Request, path: string) => Promise<Response>
  /** Auto-draft runner */
  autoDraft: {
    run: (topicId?: string, skipFrequencyCheck?: boolean) => Promise<import('./auto-draft').GenerationResult[]>
  }
}

// Create autoblogger server instance
export function createAutoblogger(config: AutobloggerServerConfig): AutobloggerServer {
  const prisma = config.prisma as any
  
  const mergedStyles: Required<StylesConfig> = {
    ...DEFAULT_STYLES,
    ...config.styles,
  }

  // Use built-in storage handler if none provided
  // Auto-detects cloud storage (S3/Spaces) from env vars, falls back to local
  const storage = config.storage || {
    upload: createStorageHandler(),
  }

  // Create destination dispatcher
  const dispatcher = createDestinationDispatcher({
    destinations: config.destinations,
    webhooks: config.webhooks,
    onPublish: config.onPublish,
    onUnpublish: config.onUnpublish,
    onDelete: config.onDelete,
  })

  // Create the base server object first (without handleRequest)
  const baseServer = {
    config: {
      ...config,
      storage,
      styles: mergedStyles,
    },
    posts: createPostsData(prisma, config.hooks, dispatcher, config.prismic?.writeToken),
    comments: createCommentsData(prisma, config.comments),
    tags: createTagsData(prisma),
    revisions: createRevisionsData(prisma),
    aiSettings: createAISettingsData(prisma),
    topics: createTopicsData(prisma),
    newsItems: createNewsItemsData(prisma),
    users: createUsersData(prisma),
    apiKeys: createApiKeysData(prisma),
    apiAuditLog: createApiAuditLogData(prisma),
  }

  // Create the full server with handleRequest and autoDraft
  const server: AutobloggerServer = {
    ...baseServer,
    handleRequest: async () => new Response('Not initialized', { status: 500 }),
    handlePublicRequest: async () => new Response('Not initialized', { status: 500 }),
    autoDraft: {
      run: async (topicId?: string, skipFrequencyCheck?: boolean) => {
        const autoDraftConfig: AutoDraftConfig = {
          prisma,
          anthropicKey: config.ai?.anthropicKey,
          openaiKey: config.ai?.openaiKey,
          onPostCreate: config.hooks?.onAutoDraftPostCreate,
        }
        return runAutoDraftInternal(autoDraftConfig, topicId, skipFrequencyCheck)
      },
    },
  }

  // Create the API handlers with the server
  const apiHandler = createAPIHandler(server)
  const publicApiHandler = createPublicAPIHandler(server)

  // Build a Request with nextUrl scoped under a virtual basePath, so existing
  // handlers that read req.nextUrl behave consistently regardless of how the
  // host actually mounts the API.
  function buildHandlerRequest(req: Request, virtualBase: string, path: string): Request & { nextUrl: URL } {
    const normalizedPath = '/' + path.replace(/^\//, '')
    const originalUrl = new URL(req.url)
    const newUrl = new URL(originalUrl.origin + virtualBase + normalizedPath)
    originalUrl.searchParams.forEach((value, key) => {
      newUrl.searchParams.set(key, value)
    })

    const handlerReq = new Request(newUrl.toString(), {
      method: req.method,
      headers: req.headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      // @ts-ignore - duplex is needed for streaming bodies
      duplex: req.method !== 'GET' && req.method !== 'HEAD' ? 'half' : undefined,
    }) as Request & { nextUrl: URL }

    Object.defineProperty(handlerReq, 'nextUrl', {
      value: newUrl,
      writable: false,
    })

    return handlerReq
  }

  server.handleRequest = async (req: Request, path: string): Promise<Response> => {
    return apiHandler(buildHandlerRequest(req, '/api/cms', path))
  }

  server.handlePublicRequest = async (req: Request, path: string): Promise<Response> => {
    return publicApiHandler(buildHandlerRequest(req, '/writer/api', path))
  }

  return server
}
