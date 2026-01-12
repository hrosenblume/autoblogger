// Generic CRUD factory for data layer

export interface CrudOptions {
  model: string
  defaultOrderBy?: Record<string, 'asc' | 'desc'>
  defaultInclude?: Record<string, unknown>
}

export interface BaseCrud<T> {
  findAll: (opts?: { skip?: number; take?: number; where?: Record<string, unknown> }) => Promise<T[]>
  findById: (id: string) => Promise<T | null>
  count: (where?: Record<string, unknown>) => Promise<number>
  create: (data: Partial<T>) => Promise<T>
  update: (id: string, data: Partial<T>) => Promise<T>
  delete: (id: string) => Promise<T>
}

/**
 * Create a base CRUD data layer for a Prisma model.
 * Use spread operator to extend with custom methods:
 * 
 * ```typescript
 * const base = createCrudData(prisma, { model: 'tag', defaultOrderBy: { name: 'asc' } })
 * return {
 *   ...base,
 *   customMethod: async () => { ... }
 * }
 * ```
 */
export function createCrudData<T>(prisma: any, options: CrudOptions): BaseCrud<T> {
  const delegate = prisma[options.model]
  
  return {
    async findAll(opts?: { skip?: number; take?: number; where?: Record<string, unknown> }) {
      return delegate.findMany({
        orderBy: options.defaultOrderBy,
        include: options.defaultInclude,
        ...opts,
      })
    },

    async findById(id: string) {
      return delegate.findUnique({
        where: { id },
        include: options.defaultInclude,
      })
    },

    async count(where?: Record<string, unknown>) {
      return delegate.count({ where })
    },

    async create(data: Partial<T>) {
      return delegate.create({ data })
    },

    async update(id: string, data: Partial<T>) {
      return delegate.update({
        where: { id },
        data,
      })
    },

    async delete(id: string) {
      return delegate.delete({ where: { id } })
    },
  }
}
