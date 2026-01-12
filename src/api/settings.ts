import type { AutobloggerServer, Session } from '../server'

type NextRequest = Request & { nextUrl: URL }

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
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
  if (!session) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

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
    if (!cms.config.auth.isAdmin(session)) {
      return jsonResponse({ error: 'Forbidden' }, 403)
    }

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
