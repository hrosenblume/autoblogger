export interface ApiAuditLogEntry {
  id: string
  apiKeyId: string | null
  apiKeyName: string
  method: string
  path: string
  postId: string | null
  status: number
  ip: string | null
  userAgent: string | null
  createdAt: Date
}

export interface AppendInput {
  apiKeyId: string | null
  apiKeyName: string
  method: string
  path: string
  postId?: string | null
  status: number
  ip?: string | null
  userAgent?: string | null
}

export function createApiAuditLogData(prisma: any) {
  return {
    /**
     * Append an audit log entry. Fire-and-forget — failures are logged but
     * never bubble up to the caller, since logging must not break API responses.
     */
    async append(input: AppendInput): Promise<void> {
      try {
        await prisma.apiAuditLog.create({
          data: {
            apiKeyId: input.apiKeyId,
            apiKeyName: input.apiKeyName,
            method: input.method,
            path: input.path,
            postId: input.postId ?? null,
            status: input.status,
            ip: input.ip ?? null,
            userAgent: input.userAgent ?? null,
          },
        })
      } catch (err) {
        console.error('[autoblogger] Failed to write audit log:', err)
      }
    },

    async findAll(opts?: {
      keyId?: string
      postId?: string
      page?: number
      limit?: number
    }): Promise<{ data: ApiAuditLogEntry[]; total: number }> {
      const page = opts?.page && opts.page > 0 ? opts.page : 1
      const limit = opts?.limit && opts.limit > 0 ? Math.min(opts.limit, 200) : 50
      const where: Record<string, unknown> = {}
      if (opts?.keyId) where.apiKeyId = opts.keyId
      if (opts?.postId) where.postId = opts.postId

      const [data, total] = await Promise.all([
        prisma.apiAuditLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.apiAuditLog.count({ where }),
      ])

      return { data, total }
    },
  }
}
