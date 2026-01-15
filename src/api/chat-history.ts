import type { PrismaClient } from '@prisma/client'

interface ChatHistoryRequest {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Handle chat history API requests.
 * GET - Fetch recent messages
 * POST - Save a new message
 * DELETE - Clear all messages
 */
export async function handleChatHistoryAPI(
  req: Request,
  prisma: PrismaClient,
  isAuthenticated: boolean
): Promise<Response> {
  // Require authentication
  if (!isAuthenticated) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const method = req.method

  try {
    // GET - Fetch recent messages
    if (method === 'GET') {
      const messages = await (prisma as any).chatMessage.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
      
      // Return in chronological order
      return new Response(JSON.stringify(messages.reverse()), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // POST - Save a new message
    if (method === 'POST') {
      const body: ChatHistoryRequest = await req.json()
      
      if (!body.role || !body.content) {
        return new Response(JSON.stringify({ error: 'Missing role or content' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const message = await (prisma as any).chatMessage.create({
        data: {
          role: body.role,
          content: body.content,
        },
      })

      return new Response(JSON.stringify(message), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // DELETE - Clear all messages
    if (method === 'DELETE') {
      await (prisma as any).chatMessage.deleteMany({})
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[Chat History API Error]', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
