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
      autoDraftRules?: string
      planRules?: string
      defaultModel?: string
      autoDraftWordCount?: number
      generateTemplate?: string | null
      chatTemplate?: string | null
      rewriteTemplate?: string | null
      autoDraftTemplate?: string | null
      planTemplate?: string | null
      expandPlanTemplate?: string | null
    }) {
      return prisma.aISettings.upsert({
        where: { id: DEFAULT_ID },
        create: { id: DEFAULT_ID, ...data },
        update: data,
      })
    },
  }
}
