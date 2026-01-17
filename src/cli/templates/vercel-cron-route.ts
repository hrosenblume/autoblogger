export const VERCEL_CRON_ROUTE_TEMPLATE = `import { NextResponse } from 'next/server'
import { cms } from '@/lib/cms'

/**
 * Vercel Cron endpoint for RSS auto-draft generation.
 * 
 * Triggered by Vercel Cron on schedule defined in vercel.json.
 * Fetches RSS feeds for active topic subscriptions and generates essay drafts.
 * 
 * To test manually:
 *   curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/auto-draft
 */
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron (security)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = new Date()
  console.log(\`[\${startTime.toISOString()}] Starting auto-draft via Vercel Cron...\`)

  try {
    const results = await cms.autoDraft.run()

    if (results.length === 0) {
      console.log('  No active topics to process.')
    } else {
      let totalGenerated = 0
      let totalSkipped = 0

      for (const r of results) {
        console.log(\`  \${r.topicName}: generated \${r.generated}, skipped \${r.skipped}\`)
        totalGenerated += r.generated
        totalSkipped += r.skipped
      }

      console.log('  ---')
      console.log(\`  Total: \${totalGenerated} essays generated, \${totalSkipped} articles skipped\`)
    }

    const endTime = new Date()
    const duration = (endTime.getTime() - startTime.getTime()) / 1000
    console.log(\`[\${endTime.toISOString()}] Done in \${duration.toFixed(1)}s\`)

    return NextResponse.json({
      success: true,
      results,
      duration: \`\${duration.toFixed(1)}s\`,
    })
  } catch (error) {
    console.error('Auto-draft failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Auto-draft failed' },
      { status: 500 }
    )
  }
}

// Vercel Cron requires a longer timeout for AI generation
export const maxDuration = 300 // 5 minutes
`
