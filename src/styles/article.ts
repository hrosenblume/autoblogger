export const ARTICLE_LAYOUT = {
  maxWidth: 680,
  padding: 24,
} as const

export const ARTICLE_CLASSES = {
  container: 'max-w-ab-content mx-auto px-ab-content-padding',
  title: 'text-ab-title font-bold',
  subtitle: 'text-ab-h2 text-muted-foreground',
  byline: 'text-sm text-muted-foreground',
  body: 'text-ab-body prose dark:prose-invert',
  prose: 'prose dark:prose-invert max-w-none',
} as const

export type ArticleClasses = typeof ARTICLE_CLASSES
