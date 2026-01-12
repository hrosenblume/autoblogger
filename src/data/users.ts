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
  return {
    async count() {
      return prisma.user.count()
    },

    async findAll() {
      return prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      })
    },

    async findById(id: string) {
      return prisma.user.findUnique({ where: { id } })
    },

    async findByEmail(email: string) {
      return prisma.user.findUnique({ where: { email } })
    },

    async create(data: CreateUserInput) {
      return prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          role: data.role || 'writer',
        },
      })
    },

    async update(id: string, data: UpdateUserInput) {
      return prisma.user.update({
        where: { id },
        data,
      })
    },

    async delete(id: string) {
      return prisma.user.delete({ where: { id } })
    },
  }
}
