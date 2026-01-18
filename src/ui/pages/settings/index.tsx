'use client'

import { useDashboardContext } from '../../context'
import { Skeleton } from '../../components/Skeleton'
import { PageContainer } from '../../components/PageContainer'

// Extracted settings components
import { UsersSettings } from './UsersSettings'
import { GeneralSettings } from './GeneralSettings'
import { IntegrationsSettings } from './IntegrationsSettings'
import { CommentsSettings } from './CommentsSettings'
import { AISettings } from './AISettings'
import { TagsSettings } from './TagsSettings'
import { TopicsSettings } from './TopicsSettings'
import { PostsSettings } from './PostsSettings'
import { RevisionsSettings, RevisionDetail } from './RevisionsSettings'
import { CollapsibleTemplate } from './CollapsibleTemplate'

interface SettingsLink {
  path: string
  label: string
  description: string
  countKey?: string
}

export function SettingsPage({ subPath }: { subPath: string }) {
  const { navigate, sharedData, sharedDataLoading } = useDashboardContext()
  const counts = sharedData?.counts || {}
  const autoDraftEnabled = sharedData?.settings?.autoDraftEnabled ?? false
  const loading = sharedDataLoading

  const allSettingsLinks: SettingsLink[] = [
    { path: '/settings/users', label: 'Users', description: 'Manage who can access the CMS', countKey: 'users' },
    { path: '/settings/posts', label: 'All Posts', description: 'Manage all posts', countKey: 'posts' },
    { path: '/settings/tags', label: 'Tags', description: 'Organize posts with tags', countKey: 'tags' },
    { path: '/settings/ai', label: 'AI Settings', description: 'Configure AI models and rules' },
    { path: '/settings/integrations', label: 'CMS Integrations', description: 'Connect to external CMS systems' },
    { path: '/settings/revisions', label: 'Revisions', description: 'View revision history' },
    { path: '/settings/comments', label: 'Comments', description: 'Manage post comments' },
    { path: '/settings/topics', label: 'Topics', description: 'RSS subscriptions for auto-draft', countKey: 'topics' },
    { path: '/settings/general', label: 'General', description: 'Post URLs and site settings' },
  ]

  // Filter out Topics if autoDraftEnabled is off
  const settingsLinks = autoDraftEnabled 
    ? allSettingsLinks 
    : allSettingsLinks.filter(link => link.path !== '/settings/topics')

  // Main settings overview
  if (!subPath || subPath === '/') {
    if (loading) {
      return (
        <PageContainer>
          <Skeleton className="h-7 w-24 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="p-4 sm:p-6 border border-border rounded-lg">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-8 w-12 mt-2" />
              </div>
            ))}
          </div>
        </PageContainer>
      )
    }

    return (
      <PageContainer>
        <h2 className="text-lg font-semibold pb-3 mb-5 border-b border-border">Settings</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {settingsLinks.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="p-4 sm:p-6 border border-border rounded-lg text-left hover:bg-accent transition-colors"
            >
              <p className="text-sm text-muted-foreground">{item.label}</p>
              {item.countKey ? (
                <p className="text-2xl font-bold mt-1">{counts[item.countKey] ?? 0}</p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">Configure →</p>
              )}
            </button>
          ))}
        </div>
      </PageContainer>
    )
  }

  // Sub-pages - each component renders its own header
  const pageName = subPath.slice(1) // Remove leading /
  
  // Handle revision detail page: /revisions/:id
  const revisionDetailMatch = pageName.match(/^revisions\/(.+)$/)
  
  return (
    <PageContainer>
      {pageName === 'general' && <GeneralSettings />}
      {pageName === 'users' && <UsersSettings />}
      {pageName === 'ai' && <AISettings />}
      {pageName === 'tags' && <TagsSettings />}
      {pageName === 'topics' && <TopicsSettings />}
      {pageName === 'integrations' && <IntegrationsSettings />}
      {pageName === 'posts' && <PostsSettings />}
      {pageName === 'revisions' && <RevisionsSettings />}
      {revisionDetailMatch && <RevisionDetail revisionId={revisionDetailMatch[1]} />}
      {pageName === 'comments' && <CommentsSettings />}
    </PageContainer>
  )
}

// Re-export types for external use
export * from './types'

// Re-export CollapsibleTemplate for use in AI settings
export { CollapsibleTemplate }
