import { createCrudData } from './factory'

interface CreateUserInput {
  email: string
  name?: string
  role?: string
}

interface UpdateUserInput {
  name?: string
  role?: string
}

export function createUsersData(prisma: any) {
  const base = createCrudData(prisma, {
    model: 'user',
    defaultOrderBy: { createdAt: 'desc' },
  })

  return {
    ...base,

    async findByEmail(email: string) {
      return prisma.user.findUnique({ where: { email } })
    },

    // Override create with proper defaults
    async create(data: CreateUserInput) {
      return prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          role: data.role || 'writer',
        },
      })
    },

    // Override update with proper typing
    async update(id: string, data: UpdateUserInput) {
      return prisma.user.update({
        where: { id },
        data,
      })
    },
  }
}
