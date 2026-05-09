import { randomBytes, createHash } from 'node:crypto'

export interface ApiKey {
  id: string
  name: string
  prefix: string
  hash: string
  ownerUserId: string | null
  createdAt: Date
  lastUsedAt: Date | null
  revokedAt: Date | null
}

export interface VerifiedKey {
  id: string
  name: string
}

const TOKEN_PREFIX = 'ab_live_'

function hashToken(plaintext: string): string {
  return createHash('sha256').update(plaintext).digest('hex')
}

function generatePlaintext(): string {
  return TOKEN_PREFIX + randomBytes(16).toString('hex')
}

export function createApiKeysData(prisma: any) {
  return {
    async findAll(): Promise<ApiKey[]> {
      return prisma.apiKey.findMany({
        orderBy: { createdAt: 'desc' },
      })
    },

    async findById(id: string): Promise<ApiKey | null> {
      return prisma.apiKey.findUnique({ where: { id } })
    },

    /**
     * Create a new API key. Returns the plaintext token ONCE — it is hashed
     * before storage and cannot be recovered later.
     */
    async create(input: { name: string; ownerUserId?: string | null }): Promise<{ key: ApiKey; plaintext: string }> {
      const plaintext = generatePlaintext()
      const prefix = plaintext.slice(0, 12)
      const hash = hashToken(plaintext)

      const key = await prisma.apiKey.create({
        data: {
          name: input.name,
          prefix,
          hash,
          ownerUserId: input.ownerUserId ?? null,
        },
      })

      return { key, plaintext }
    },

    async revoke(id: string): Promise<ApiKey> {
      return prisma.apiKey.update({
        where: { id },
        data: { revokedAt: new Date() },
      })
    },

    async delete(id: string): Promise<void> {
      await prisma.apiKey.delete({ where: { id } })
    },

    /**
     * Look up a key by its plaintext value. Returns null if not found or revoked.
     */
    async verify(plaintext: string): Promise<VerifiedKey | null> {
      if (!plaintext.startsWith(TOKEN_PREFIX)) return null
      const hash = hashToken(plaintext)
      const key = await prisma.apiKey.findUnique({ where: { hash } })
      if (!key) return null
      if (key.revokedAt) return null
      return { id: key.id, name: key.name }
    },

    /**
     * Bump lastUsedAt. Fire-and-forget; failures should not affect the request.
     */
    async touch(id: string): Promise<void> {
      try {
        await prisma.apiKey.update({
          where: { id },
          data: { lastUsedAt: new Date() },
        })
      } catch (err) {
        console.error('[autoblogger] Failed to touch API key:', err)
      }
    },
  }
}
