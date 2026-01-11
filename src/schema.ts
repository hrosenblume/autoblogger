// Schema validation helper

const REQUIRED_TABLES = [
  'Post',
  'Revision',
  'Comment',
  'Tag',
  'PostTag',
  'AISettings',
  'TopicSubscription',
  'NewsItem',
]

export interface SchemaValidationResult {
  valid: boolean
  missingTables: string[]
}

export async function validateSchema(prisma: unknown): Promise<SchemaValidationResult> {
  const p = prisma as any
  const missingTables: string[] = []

  for (const table of REQUIRED_TABLES) {
    const modelName = table.charAt(0).toLowerCase() + table.slice(1)
    try {
      // Try to access the model - if it doesn't exist, it will throw
      if (!p[modelName]) {
        missingTables.push(table)
      } else {
        // Try a simple query to verify the table exists
        await p[modelName].findFirst({ take: 1 }).catch(() => {
          missingTables.push(table)
        })
      }
    } catch {
      missingTables.push(table)
    }
  }

  return {
    valid: missingTables.length === 0,
    missingTables,
  }
}
