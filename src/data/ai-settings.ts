export function createAISettingsData(prisma: any) {
  const DEFAULT_ID = 'default'

  return {
    async get() {
      let settings = await prisma.aISettings.findUnique({ where: { id: DEFAULT_ID } })
      
      if (!settings) {
        settings = await prisma.aISettings.create({
          data: { id: DEFAULT_ID },
        })
      }
      
      return settings
    },

    async update(data: {
      rules?: string
      chatRules?: string
      rewriteRules?: string
      defaultModel?: string
      generateTemplate?: string
      chatTemplate?: string
      rewriteTemplate?: string
    }) {
      return prisma.aISettings.upsert({
        where: { id: DEFAULT_ID },
        create: { id: DEFAULT_ID, ...data },
        update: data,
      })
    },
  }
}
