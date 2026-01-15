import { generate, resolveModel, buildAutoDraftPrompt, parseGeneratedContent } from '../ai'
import { generateSlug } from '../lib/markdown'
import { fetchRssFeeds, type RssArticle } from './rss'
import { filterByKeywords } from './keywords'

export interface GenerationResult {
  topicId: string
  topicName: string
  generated: number
  skipped: number
}

export interface AutoDraftConfig {
  prisma: any
  anthropicKey?: string
  openaiKey?: string
  /** Called after generating an essay, before creating the post. Return additional post fields. */
  onPostCreate?: (article: RssArticle, essay: { title: string; subtitle: string | null; markdown: string }) => Record<string, unknown> | Promise<Record<string, unknown>>
}

/**
 * Get style context from the database for AI generation.
 */
async function getStyleContext(prisma: any) {
  const settings = await prisma.aISettings.findUnique({ where: { id: 'default' } })
  const posts = await prisma.post.findMany({
    where: { status: 'published' },
    select: { title: true, subtitle: true, markdown: true },
    orderBy: { publishedAt: 'desc' },
    take: 10,
  })
  
  const styleExamples = posts
    .map((p: { title: string; subtitle?: string; markdown: string }) => 
      `# ${p.title}\n${p.subtitle ? `*${p.subtitle}*\n\n` : ''}${p.markdown}`
    )
    .join('\n\n---\n\n')
  
  return {
    rules: settings?.rules || '',
    autoDraftRules: settings?.autoDraftRules || '',
    styleExamples,
  }
}

/**
 * Check if a topic should run based on its frequency and lastRunAt.
 */
function shouldRunTopic(topic: { frequency: string; lastRunAt: Date | null }): boolean {
  if (topic.frequency === 'manual') return false
  if (!topic.lastRunAt) return true

  const now = new Date()
  const lastRun = new Date(topic.lastRunAt)
  const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60)

  if (topic.frequency === 'daily') return hoursSinceLastRun >= 23
  if (topic.frequency === 'weekly') return hoursSinceLastRun >= 167 // ~7 days
  
  return true
}

/**
 * Deduplicate articles against existing NewsItems (global, across all topics).
 */
async function deduplicateArticles(
  prisma: any,
  articles: RssArticle[]
): Promise<RssArticle[]> {
  const articleUrls = articles.map(a => a.url)
  const existingUrls = await prisma.newsItem.findMany({
    where: { url: { in: articleUrls } },
    select: { url: true },
  })
  
  const urlSet = new Set(existingUrls.map((n: { url: string }) => n.url))
  return articles.filter(a => !urlSet.has(a.url))
}

/**
 * Generate a unique slug for a post.
 * If the slug already exists, appends -2, -3, etc.
 */
async function generateUniqueSlug(prisma: any, title: string): Promise<string> {
  const baseSlug = generateSlug(title)
  
  // Check if base slug is available
  const existing = await prisma.post.findUnique({ where: { slug: baseSlug } })
  if (!existing) return baseSlug

  // Find next available suffix
  let suffix = 2
  while (suffix < 100) {
    const candidateSlug = `${baseSlug}-${suffix}`
    const exists = await prisma.post.findUnique({ where: { slug: candidateSlug } })
    if (!exists) return candidateSlug
    suffix++
  }

  // Fallback: add random suffix
  return `${baseSlug}-${Date.now()}`
}

/**
 * Generate an essay from an article using AI.
 */
async function generateEssayFromArticle(
  config: AutoDraftConfig,
  article: RssArticle,
  topicName: string,
  essayFocus?: string | null
): Promise<{ title: string; subtitle: string | null; markdown: string }> {
  const context = await getStyleContext(config.prisma)
  
  const systemPrompt = buildAutoDraftPrompt({
    autoDraftRules: context.autoDraftRules,
    rules: context.rules,
    wordCount: 800,
    styleExamples: context.styleExamples,
    topicName: topicName,
    articleTitle: article.title,
    articleSummary: article.summary || '',
    articleUrl: article.url,
  })
  
  // Resolve the default model
  const model = await resolveModel(undefined, async () => {
    const settings = await config.prisma.aISettings.findUnique({ where: { id: 'default' } })
    return settings?.defaultModel || null
  })

  // User prompt is minimal since all instructions are in the system prompt
  const userPrompt = essayFocus 
    ? `Write the essay now. Focus on: ${essayFocus}`
    : 'Write the essay now.'
  
  const result = await generate(model.id, systemPrompt, userPrompt, {
    maxTokens: 4096,
    anthropicKey: config.anthropicKey,
    openaiKey: config.openaiKey,
  })
  const parsed = parseGeneratedContent(result.text)

  return {
    title: parsed.title || article.title,
    subtitle: parsed.subtitle || null,
    markdown: parsed.body,
  }
}

/**
 * Run auto-draft for one or all active topics.
 * @param config - Configuration including prisma client and API keys
 * @param topicId - Optional: run for a specific topic only
 * @param skipFrequencyCheck - If true, ignore frequency settings (for manual trigger)
 */
export async function runAutoDraft(
  config: AutoDraftConfig,
  topicId?: string,
  skipFrequencyCheck = false
): Promise<GenerationResult[]> {
  const { prisma } = config

  // Check master toggle first
  const integrationSettings = await prisma.integrationSettings.findUnique({
    where: { id: 'default' },
  }) as { autoDraftEnabled?: boolean } | null
  if (!integrationSettings?.autoDraftEnabled) {
    console.log('Auto-draft is disabled. Skipping.')
    return []
  }

  const topics = topicId
    ? await prisma.topicSubscription.findMany({ where: { id: topicId, isActive: true } })
    : await prisma.topicSubscription.findMany({ where: { isActive: true } })

  const results: GenerationResult[] = []

  for (const topic of topics) {
    // Skip if frequency check applies and topic shouldn't run
    if (!skipFrequencyCheck && !shouldRunTopic(topic)) {
      continue
    }

    try {
      // 1. Fetch RSS feeds
      const feedUrls: string[] = JSON.parse(topic.rssFeeds)
      const articles = await fetchRssFeeds(feedUrls)

      // 2. Filter by keywords (if enabled)
      const keywords: string[] = JSON.parse(topic.keywords)
      const relevant = topic.useKeywordFilter
        ? filterByKeywords(articles, keywords)
        : articles

      // 3. Deduplicate (skip URLs already processed globally)
      const newArticles = await deduplicateArticles(prisma, relevant)

      // 4. Generate essays (up to maxPerPeriod)
      const toGenerate = newArticles.slice(0, topic.maxPerPeriod)
      let generated = 0

      for (const article of toGenerate) {
        try {
          // Create NewsItem first
          const newsItem = await prisma.newsItem.create({
            data: {
              topicId: topic.id,
              url: article.url,
              title: article.title,
              summary: article.summary,
              publishedAt: article.publishedAt,
              status: 'pending',
            },
          })

          // Generate essay with AI
          const essay = await generateEssayFromArticle(config, article, topic.name, topic.essayFocus)

          // Generate unique slug
          const slug = await generateUniqueSlug(prisma, essay.title)

          // Get additional fields from hook (e.g., polyhedraShape)
          const extraFields = config.onPostCreate 
            ? await config.onPostCreate(article, essay)
            : {}

          // Create suggested post
          const post = await prisma.post.create({
            data: {
              title: essay.title,
              subtitle: essay.subtitle,
              slug,
              markdown: essay.markdown,
              status: 'suggested',
              sourceUrl: article.url,
              topicId: topic.id,
              ...extraFields,
            },
          })

          // Link NewsItem to Post
          await prisma.newsItem.update({
            where: { id: newsItem.id },
            data: { postId: post.id, status: 'generated' },
          })

          generated++
        } catch (articleError) {
          console.error(`Failed to process article: ${article.title}`, articleError)
          // Continue with other articles
        }
      }

      // 5. Update lastRunAt
      await prisma.topicSubscription.update({
        where: { id: topic.id },
        data: { lastRunAt: new Date() },
      })

      results.push({
        topicId: topic.id,
        topicName: topic.name,
        generated,
        skipped: relevant.length - generated,
      })
    } catch (topicError) {
      console.error(`Failed to process topic: ${topic.name}`, topicError)
      results.push({
        topicId: topic.id,
        topicName: topic.name,
        generated: 0,
        skipped: 0,
      })
    }
  }

  return results
}
