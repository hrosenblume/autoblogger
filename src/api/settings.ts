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
      } 
    })
  }

  // PATCH /settings - update general settings
  if (method === 'PATCH' && path === '/settings') {
    // Check admin
    const adminError = requireAdmin(cms, session)
    if (adminError) return adminError

    const body = await req.json()
    
    // Update autoDraftEnabled in IntegrationSettings
    if (typeof body.autoDraftEnabled === 'boolean') {
      await prisma.integrationSettings.upsert({
        where: { id: 'default' },
        create: { id: 'default', autoDraftEnabled: body.autoDraftEnabled },
        update: { autoDraftEnabled: body.autoDraftEnabled },
      })
    }

    const integrationSettings = await prisma.integrationSettings.findUnique({
      where: { id: 'default' },
    })

    return jsonResponse({ 
      data: { 
        autoDraftEnabled: integrationSettings?.autoDraftEnabled ?? false,
      } 
    })
  }

  return jsonResponse({ error: 'Not found' }, 404)
}
