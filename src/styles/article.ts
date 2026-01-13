export const ARTICLE_LAYOUT = {
  maxWidth: 680,
  padding: 24,
} as const

export const ARTICLE_CLASSES = {
  container: 'max-w-[680px] mx-auto px-6',
  title: 'text-title font-bold',
  subtitle: 'text-h2 text-muted-foreground',
  byline: 'text-sm text-muted-foreground',
  body: 'text-body prose dark:prose-invert',
  prose: 'prose dark:prose-invert max-w-none',
} as const

export type ArticleClasses = typeof ARTICLE_CLASSES
