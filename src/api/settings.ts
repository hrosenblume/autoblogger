import type { AutobloggerServer, Session } from '../server'
import { jsonResponse, requireAuth, requireAdmin } from './utils'

type NextRequest = Request & { nextUrl: URL }

// Type for Prismic integration settings
interface PrismicSettings {
  prismicEnabled: boolean
  prismicRepository: string | null
  prismicWriteToken: string | null
  prismicDocumentType: string
  prismicSyncMode: string
  prismicLocale: string
  prismicAutoRename: boolean
}

// Mask sensitive token for API response
function maskToken(token: string | null): string {
  if (!token) return ''
  if (token.length <= 8) return '••••••••'
  return token.slice(0, 4) + '••••••••' + token.slice(-4)
}

export async function handleSettingsAPI(
  req: NextRequest,
  cms: AutobloggerServer,
  session: Session | null,
  path: string
): Promise<Response> {
  const method = req.method
  const prisma = cms.config.prisma as any

  // Check auth
  const authError = requireAuth(session)
  if (authError) return authError

  // GET /settings - get general settings
  if (method === 'GET' && path === '/settings') {
    // Get autoDraftEnabled from IntegrationSettings
    const integrationSettings = await prisma.integrationSettings.findUnique({
      where: { id: 'default' },
    })
    
    return jsonResponse({ 
      data: { 
        autoDraftEnabled: integrationSettings?.autoDraftEnabled ?? false,
        postUrlPattern: integrationSettings?.postUrlPattern ?? '/e/{slug}',
      } 
    })
  }

  // PATCH /settings - update general settings
  if (method === 'PATCH' && path === '/settings') {
    // Check admin
    const adminError = requireAdmin(cms, session)
    if (adminError) return adminError

    const body = await req.json()
    
    // Build update object
    const updateData: { autoDraftEnabled?: boolean; postUrlPattern?: string } = {}
    if (typeof body.autoDraftEnabled === 'boolean') {
      updateData.autoDraftEnabled = body.autoDraftEnabled
    }
    if (typeof body.postUrlPattern === 'string') {
      updateData.postUrlPattern = body.postUrlPattern
    }
    
    // Upsert IntegrationSettings
    if (Object.keys(updateData).length > 0) {
      await prisma.integrationSettings.upsert({
        where: { id: 'default' },
        create: { id: 'default', ...updateData },
        update: updateData,
      })
    }

    const integrationSettings = await prisma.integrationSettings.findUnique({
      where: { id: 'default' },
    })

    return jsonResponse({ 
      data: { 
        autoDraftEnabled: integrationSettings?.autoDraftEnabled ?? false,
        postUrlPattern: integrationSettings?.postUrlPattern ?? '/e/{slug}',
      } 
    })
  }

  // GET /settings/integrations - get integration settings (Prismic, etc.)
  if (method === 'GET' && path === '/settings/integrations') {
    const integrationSettings = await prisma.integrationSettings.findUnique({
      where: { id: 'default' },
    })
    
    // Check for config fallbacks (passed through config from host app)
    const configRepo = cms.config.prismic?.repository
    const hasEnvToken = !!cms.config.prismic?.writeToken
    const hasDbToken = !!integrationSettings?.prismicWriteToken
    
    return jsonResponse({ 
      data: { 
        prismic: {
          enabled: integrationSettings?.prismicEnabled ?? false,
          repository: integrationSettings?.prismicRepository ?? '',
          configRepository: configRepo ?? null,
          writeToken: maskToken(integrationSettings?.prismicWriteToken),
          hasWriteToken: hasDbToken,
          hasEnvToken: hasEnvToken,
          documentType: integrationSettings?.prismicDocumentType ?? 'autoblog',
          syncMode: integrationSettings?.prismicSyncMode ?? 'stub',
          locale: integrationSettings?.prismicLocale ?? 'en-us',
          autoRename: integrationSettings?.prismicAutoRename ?? false,
        }
      } 
    })
  }

  // PATCH /settings/integrations - update integration settings
  if (method === 'PATCH' && path === '/settings/integrations') {
    // Check admin
    const adminError = requireAdmin(cms, session)
    if (adminError) return adminError

    const body = await req.json()
    
    // Build update object for Prismic settings
    const updateData: Partial<PrismicSettings> = {}
    
    if (typeof body.prismicEnabled === 'boolean') {
      updateData.prismicEnabled = body.prismicEnabled
    }
    if (typeof body.prismicRepository === 'string') {
      updateData.prismicRepository = body.prismicRepository || null
    }
    if (typeof body.prismicWriteToken === 'string') {
      // Only update if not the masked placeholder
      if (!body.prismicWriteToken.includes('••••')) {
        updateData.prismicWriteToken = body.prismicWriteToken || null
      }
    }
    if (typeof body.prismicDocumentType === 'string') {
      updateData.prismicDocumentType = body.prismicDocumentType || 'autoblog'
    }
    if (typeof body.prismicSyncMode === 'string' && ['stub', 'full'].includes(body.prismicSyncMode)) {
      updateData.prismicSyncMode = body.prismicSyncMode
    }
    if (typeof body.prismicLocale === 'string') {
      updateData.prismicLocale = body.prismicLocale || 'en-us'
    }
    if (typeof body.prismicAutoRename === 'boolean') {
      updateData.prismicAutoRename = body.prismicAutoRename
    }

    // Validate: if enabling, repository and write token are required (env var counts as token)
    if (updateData.prismicEnabled === true) {
      const current = await prisma.integrationSettings.findUnique({
        where: { id: 'default' },
      })
      
      const repo = updateData.prismicRepository ?? current?.prismicRepository
      const hasDbToken = !!(updateData.prismicWriteToken ?? current?.prismicWriteToken)
      const hasEnvToken = !!cms.config.prismic?.writeToken
      
      if (!repo) {
        return jsonResponse({ error: 'Repository name is required to enable Prismic' }, 400)
      }
      if (!hasDbToken && !hasEnvToken) {
        return jsonResponse({ error: 'Write token is required to enable Prismic (set PRISMIC_WRITE_TOKEN in config or enter in field)' }, 400)
      }
    }
    
    // Upsert IntegrationSettings
    if (Object.keys(updateData).length > 0) {
      await prisma.integrationSettings.upsert({
        where: { id: 'default' },
        create: { id: 'default', ...updateData },
        update: updateData,
      })
    }

    const integrationSettings = await prisma.integrationSettings.findUnique({
      where: { id: 'default' },
    })

    return jsonResponse({ 
      data: { 
        prismic: {
          enabled: integrationSettings?.prismicEnabled ?? false,
          repository: integrationSettings?.prismicRepository ?? '',
          writeToken: maskToken(integrationSettings?.prismicWriteToken),
          hasWriteToken: !!integrationSettings?.prismicWriteToken,
          documentType: integrationSettings?.prismicDocumentType ?? 'autoblog',
          syncMode: integrationSettings?.prismicSyncMode ?? 'stub',
          locale: integrationSettings?.prismicLocale ?? 'en-us',
          autoRename: integrationSettings?.prismicAutoRename ?? false,
        }
      } 
    })
  }

  return jsonResponse({ error: 'Not found' }, 404)
}
