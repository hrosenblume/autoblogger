export const DASHBOARD_PAGE_TEMPLATE = `import { AutobloggerDashboard } from 'autoblogger/ui'
// TODO: Import your auth function
// import { auth } from '@/lib/auth'
// import { redirect } from 'next/navigation'

export default async function WriterPage({ 
  params 
}: { 
  params: Promise<{ path?: string[] }> 
}) {
  // TODO: Protect this route with your auth
  // const session = await auth()
  // if (!session) {
  //   redirect('/login')
  // }

  // Mock session for initial setup (remove in production!)
  const session = {
    user: {
      id: 'user-1',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'admin',
    }
  }
  
  const { path } = await params
  
  return (
    <AutobloggerDashboard 
      apiBasePath="/api/cms"
      session={session}
      path={path?.join('/') || ''}
    />
  )
}
`
