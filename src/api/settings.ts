import type { AutobloggerServer, Session } from '../server'
import { jsonResponse, requireAuth, requireAdmin } from './utils'

type NextRequest = Request & { nextUrl: URL }

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

  return jsonResponse({ error: 'Not found' }, 404)
}
