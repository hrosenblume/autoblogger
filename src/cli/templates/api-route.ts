export const API_ROUTE_TEMPLATE = `import { cms } from '@/lib/cms'
import { NextRequest } from 'next/server'

async function handler(
  req: NextRequest, 
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return cms.handleRequest(req, path.join('/'))
}

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE }
`
