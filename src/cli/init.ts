import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import pc from 'picocolors'

import { detectProject, countMarkdownFiles } from './utils/detect'
import { createBackup } from './utils/backup'
import { checkConflicts, mergeSchema, writeSchema } from './utils/prisma-merge'
import { findGlobalsCss, patchGlobalsCss } from './utils/css-patch'
import { promptInit, log, confirm } from './utils/prompts'
import { CMS_CONFIG_TEMPLATE, API_ROUTE_TEMPLATE, DASHBOARD_PAGE_TEMPLATE, WRITER_LAYOUT_TEMPLATE, AUTO_DRAFT_SCRIPT_TEMPLATE, VERCEL_CRON_ROUTE_TEMPLATE } from './templates'
import { importContent } from './import'

export interface InitOptions {
  yes?: boolean
  skipMigrate?: boolean
  importPath?: string
  dryRun?: boolean
}

export async function init(options: InitOptions = {}) {
  const cwd = process.cwd()
  
  console.log(pc.bold('\nSetting up Autoblogger...\n'))

  // Step 1: Detect project
  const project = detectProject(cwd)
  
  if (!project.isNextJs) {
    console.log(pc.yellow('Warning: This does not appear to be a Next.js project.'))
    if (!options.yes) {
      const proceed = await confirm('Continue anyway?', false)
      if (!proceed) {
        console.log('Setup cancelled.')
        return
      }
    }
  } else {
    log('check', `Detected Next.js ${project.nextVersion || ''} project`)
  }

  if (project.hasPrisma) {
    log('check', `Found ${project.prismaSchemaPath}`)
  }

  if (!project.appRouterPath) {
    console.log(pc.red('Error: Could not find App Router (app/ or src/app/ directory)'))
    console.log('Autoblogger requires Next.js App Router.')
    return
  }

  // Get content counts for prompts
  const contentCounts: Record<string, number> = {}
  for (const contentPath of project.contentPaths) {
    contentCounts[contentPath] = countMarkdownFiles(path.join(cwd, contentPath))
  }

  // Detect if this looks like a Vercel project
  const hasVercelJson = fs.existsSync(path.join(cwd, 'vercel.json'))
  const hasVercelDir = fs.existsSync(path.join(cwd, '.vercel'))
  const isLikelyVercel = hasVercelJson || hasVercelDir

  // Step 2: Prompt for options (unless --yes)
  let answers: {
    dbProvider: 'postgresql' | 'sqlite' | 'mysql'
    runMigration: boolean
    importContent: boolean
    importPath?: string
    deploymentPlatform: 'vercel' | 'server' | 'skip'
  } = {
    dbProvider: 'postgresql',
    runMigration: !options.skipMigrate,
    importContent: !!options.importPath,
    importPath: options.importPath || project.contentPaths[0],
    deploymentPlatform: isLikelyVercel ? 'vercel' : 'server',
  }

  if (!options.yes) {
    answers = await promptInit({
      hasPrisma: project.hasPrisma,
      contentPaths: project.contentPaths,
      contentCounts,
    })
  } else if (project.contentPaths.length > 0 && !options.importPath) {
    // In --yes mode, auto-import if content found
    answers.importContent = true
    answers.importPath = project.contentPaths[0]
  }

  // Step 3: Check for conflicts
  const prismaPath = project.prismaSchemaPath || path.join(cwd, 'prisma', 'schema.prisma')
  const conflicts = checkConflicts(prismaPath)
  
  if (conflicts.length > 0) {
    console.log(pc.red(`\nError: Found conflicting model names in your Prisma schema:`))
    conflicts.forEach(c => console.log(pc.red(`  - ${c}`)))
    console.log('\nPlease rename these models before running autoblogger init.')
    return
  }
  
  log('check', 'No model conflicts found')

  if (options.dryRun) {
    console.log(pc.cyan('\n--- Dry run mode: showing what would be done ---\n'))
    
    console.log('Would create/update:')
    console.log(`  - ${prismaPath} (add 11 models)`)
    console.log(`  - lib/cms.ts`)
    console.log(`  - ${project.appRouterPath}/api/cms/[...path]/route.ts`)
    console.log(`  - ${project.appRouterPath}/(writer)/writer/[[...path]]/page.tsx`)
    console.log(`  - ${project.appRouterPath}/(writer)/layout.tsx`)
    if (answers.deploymentPlatform === 'vercel') {
      console.log(`  - ${project.appRouterPath}/api/cron/auto-draft/route.ts (Vercel Cron endpoint)`)
      console.log(`  - vercel.json (add cron schedule)`)
    } else if (answers.deploymentPlatform === 'server') {
      console.log(`  - scripts/auto-draft.ts (cron script for crontab)`)
    }
    console.log(`  - globals.css (add CSS import)`)
    console.log(`  - ${project.appRouterPath}/layout.tsx (add suppressHydrationWarning, GlobalShortcuts)`)
    
    if (answers.runMigration) {
      console.log('\nWould run:')
      console.log('  - npx prisma migrate dev --name add-autoblogger')
      console.log('  - npx prisma generate')
    }
    
    if (answers.importContent && answers.importPath) {
      const count = contentCounts[answers.importPath] || countMarkdownFiles(path.join(cwd, answers.importPath))
      console.log(`\nWould import ${count} posts from ${answers.importPath}`)
    }
    
    console.log(pc.cyan('\n--- No changes made ---'))
    return
  }

  // Step 4: Create backup
  const filesToBackup: string[] = []
  if (project.hasPrisma) filesToBackup.push('prisma/schema.prisma')
  if (fs.existsSync(path.join(cwd, 'lib', 'cms.ts'))) filesToBackup.push('lib/cms.ts')
  
  if (filesToBackup.length > 0) {
    const backupPath = createBackup(filesToBackup, cwd)
    log('backup', `Created backup at ${path.relative(cwd, backupPath)}`)
  }

  // Step 5: Merge Prisma schema
  const mergeResult = mergeSchema(prismaPath, answers.dbProvider)
  if (!mergeResult.success) {
    console.log(pc.red('Error: Failed to merge Prisma schema'))
    return
  }
  writeSchema(prismaPath, mergeResult.content!)
  log('write', `Updated ${path.relative(cwd, prismaPath)} (added 11 models)`)

  // Step 6: Create boilerplate files
  const libDir = path.join(cwd, 'lib')
  const cmsConfigPath = path.join(libDir, 'cms.ts')
  
  if (fs.existsSync(cmsConfigPath)) {
    log('skip', 'lib/cms.ts already exists')
  } else {
    if (!fs.existsSync(libDir)) {
      fs.mkdirSync(libDir, { recursive: true })
    }
    fs.writeFileSync(cmsConfigPath, CMS_CONFIG_TEMPLATE)
    log('write', 'Created lib/cms.ts')
  }

  // API route
  const apiRoutePath = path.join(cwd, project.appRouterPath!, 'api', 'cms', '[...path]', 'route.ts')
  if (fs.existsSync(apiRoutePath)) {
    log('skip', `${project.appRouterPath}/api/cms/[...path]/route.ts already exists`)
  } else {
    const apiRouteDir = path.dirname(apiRoutePath)
    if (!fs.existsSync(apiRouteDir)) {
      fs.mkdirSync(apiRouteDir, { recursive: true })
    }
    fs.writeFileSync(apiRoutePath, API_ROUTE_TEMPLATE)
    log('write', `Created ${project.appRouterPath}/api/cms/[...path]/route.ts`)
  }

  // Dashboard page - in (writer) route group to avoid inheriting parent layouts
  const writerRouteGroup = path.join(cwd, project.appRouterPath!, '(writer)')
  const dashboardPath = path.join(writerRouteGroup, 'writer', '[[...path]]', 'page.tsx')
  const writerLayoutPath = path.join(writerRouteGroup, 'layout.tsx')
  
  if (fs.existsSync(dashboardPath)) {
    log('skip', `${project.appRouterPath}/(writer)/writer/[[...path]]/page.tsx already exists`)
  } else {
    const dashboardDir = path.dirname(dashboardPath)
    if (!fs.existsSync(dashboardDir)) {
      fs.mkdirSync(dashboardDir, { recursive: true })
    }
    fs.writeFileSync(dashboardPath, DASHBOARD_PAGE_TEMPLATE)
    log('write', `Created ${project.appRouterPath}/(writer)/writer/[[...path]]/page.tsx`)
  }
  
  // Minimal layout for writer route group (prevents inheriting navbar/footer from parent)
  if (fs.existsSync(writerLayoutPath)) {
    log('skip', `${project.appRouterPath}/(writer)/layout.tsx already exists`)
  } else {
    fs.writeFileSync(writerLayoutPath, WRITER_LAYOUT_TEMPLATE)
    log('write', `Created ${project.appRouterPath}/(writer)/layout.tsx`)
  }

  // Auto-draft setup based on deployment platform
  if (answers.deploymentPlatform === 'vercel') {
    // Vercel: Create API route + update vercel.json
    const cronRoutePath = path.join(cwd, project.appRouterPath!, 'api', 'cron', 'auto-draft', 'route.ts')
    
    if (fs.existsSync(cronRoutePath)) {
      log('skip', `${project.appRouterPath}/api/cron/auto-draft/route.ts already exists`)
    } else {
      const cronRouteDir = path.dirname(cronRoutePath)
      if (!fs.existsSync(cronRouteDir)) {
        fs.mkdirSync(cronRouteDir, { recursive: true })
      }
      fs.writeFileSync(cronRoutePath, VERCEL_CRON_ROUTE_TEMPLATE)
      log('write', `Created ${project.appRouterPath}/api/cron/auto-draft/route.ts`)
    }

    // Create or update vercel.json with cron config
    const vercelJsonPath = path.join(cwd, 'vercel.json')
    let vercelConfig: { crons?: Array<{ path: string; schedule: string }> } = {}
    
    if (fs.existsSync(vercelJsonPath)) {
      try {
        vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'))
      } catch {
        // Invalid JSON, start fresh
      }
    }

    // Check if cron already exists
    const cronPath = '/api/cron/auto-draft'
    const existingCron = vercelConfig.crons?.find(c => c.path === cronPath)
    
    if (existingCron) {
      log('skip', 'vercel.json already has auto-draft cron')
    } else {
      vercelConfig.crons = vercelConfig.crons || []
      vercelConfig.crons.push({
        path: cronPath,
        schedule: '0 6 * * *', // Daily at 6am UTC
      })
      fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2) + '\n')
      log('write', 'Updated vercel.json with auto-draft cron (daily at 6am UTC)')
    }
  } else if (answers.deploymentPlatform === 'server') {
    // Server: Create cron script
    const scriptsDir = path.join(cwd, 'scripts')
    const autoDraftScriptPath = path.join(scriptsDir, 'auto-draft.ts')

    if (fs.existsSync(autoDraftScriptPath)) {
      log('skip', 'scripts/auto-draft.ts already exists')
    } else {
      if (!fs.existsSync(scriptsDir)) {
        fs.mkdirSync(scriptsDir, { recursive: true })
      }
      fs.writeFileSync(autoDraftScriptPath, AUTO_DRAFT_SCRIPT_TEMPLATE)
      log('write', 'Created scripts/auto-draft.ts (schedule via crontab)')
    }
  }
  // If 'skip', do nothing for auto-draft

  // Step 7: Patch globals.css to import autoblogger styles
  const globalsCssPath = findGlobalsCss(cwd)
  if (globalsCssPath) {
    const cssResult = patchGlobalsCss(globalsCssPath)
    if (cssResult.alreadyPatched) {
      log('skip', 'globals.css already imports autoblogger styles')
    } else if (cssResult.success) {
      log('write', `Updated ${path.relative(cwd, globalsCssPath)} (added autoblogger CSS import)`)
    }
  } else {
    log('warn', 'Could not find globals.css. Please add manually:')
    console.log(pc.gray("  @import 'autoblogger/styles/standalone.css';"))
  }

  // Step 7b: Patch root layout for suppressHydrationWarning (prevents hydration warnings from theme switching)
  const rootLayoutPath = path.join(cwd, project.appRouterPath!, 'layout.tsx')
  if (fs.existsSync(rootLayoutPath)) {
    let layoutContent = fs.readFileSync(rootLayoutPath, 'utf-8')
    let layoutModified = false
    
    if (layoutContent.includes('suppressHydrationWarning')) {
      log('skip', 'Root layout already has suppressHydrationWarning')
    } else {
      // Try to add suppressHydrationWarning to the <html> tag
      const htmlTagRegex = /<html([^>]*)>/
      const match = layoutContent.match(htmlTagRegex)
      if (match) {
        const existingAttrs = match[1]
        const newHtmlTag = `<html${existingAttrs} suppressHydrationWarning>`
        layoutContent = layoutContent.replace(htmlTagRegex, newHtmlTag)
        layoutModified = true
        log('write', `Updated ${project.appRouterPath}/layout.tsx (added suppressHydrationWarning)`)
      } else {
        log('warn', 'Could not find <html> tag in root layout. Please add suppressHydrationWarning manually.')
      }
    }
    
    // Step 7c: Add GlobalShortcuts for Cmd+/ navigation to /writer from anywhere
    if (layoutContent.includes('GlobalShortcuts')) {
      log('skip', 'Root layout already has GlobalShortcuts')
    } else {
      // Add import at the top of the file
      const importStatement = "import { GlobalShortcuts } from 'autoblogger/ui'\n"
      
      // Find the best place to insert the import (after existing imports)
      const lastImportMatch = layoutContent.match(/^import .+$/gm)
      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1]
        layoutContent = layoutContent.replace(lastImport, lastImport + '\n' + importStatement.trim())
      } else {
        // No imports found, add at the top
        layoutContent = importStatement + layoutContent
      }
      
      // Add <GlobalShortcuts /> inside the body, right after the opening <body> tag
      const bodyTagRegex = /<body([^>]*)>/
      const bodyMatch = layoutContent.match(bodyTagRegex)
      if (bodyMatch) {
        layoutContent = layoutContent.replace(bodyTagRegex, `<body$1>\n        <GlobalShortcuts />`)
        layoutModified = true
        log('write', `Updated ${project.appRouterPath}/layout.tsx (added GlobalShortcuts for Cmd+/ navigation)`)
      } else {
        log('warn', 'Could not find <body> tag in root layout. Please add GlobalShortcuts manually.')
        console.log(pc.gray("  import { GlobalShortcuts } from 'autoblogger/ui'"))
        console.log(pc.gray("  // Add <GlobalShortcuts /> inside your layout body"))
      }
    }
    
    if (layoutModified) {
      fs.writeFileSync(rootLayoutPath, layoutContent)
    }
  }

  // Step 8: Run migration
  if (answers.runMigration) {
    console.log('')
    log('run', 'prisma migrate dev --name add-autoblogger')
    
    try {
      execSync('npx prisma migrate dev --name add-autoblogger', {
        cwd,
        stdio: 'inherit',
      })
      
      log('run', 'prisma generate')
      execSync('npx prisma generate', {
        cwd,
        stdio: 'inherit',
      })
    } catch (error) {
      log('error', 'Migration failed. You may need to run it manually:')
      console.log(pc.gray('  npx prisma migrate dev --name add-autoblogger'))
      console.log(pc.gray('  npx prisma generate'))
    }
  }

  // Step 9: Import content
  if (answers.importContent && answers.importPath) {
    console.log('')
    const count = contentCounts[answers.importPath] || countMarkdownFiles(path.join(cwd, answers.importPath))
    log('info', `Found ${count} markdown files in ${answers.importPath}`)
    
    try {
      await importContent(path.join(cwd, answers.importPath), { status: 'draft' })
    } catch (error) {
      log('warn', `Content import failed: ${error instanceof Error ? error.message : error}`)
      console.log(pc.gray('  You can import later with: npx autoblogger import <path>'))
    }
  }

  // Done!
  console.log('')
  console.log(pc.green(pc.bold('Done!')) + ' Visit ' + pc.cyan('localhost:3000/writer') + ' to access your CMS dashboard.')
  console.log('')
  console.log(pc.gray('Next steps:'))
  console.log(pc.gray('  1. Update lib/cms.ts with your auth configuration'))
  console.log(pc.gray('  2. Add your auth check to app/(writer)/writer/[[...path]]/page.tsx'))
  console.log(pc.gray('  3. Set ANTHROPIC_API_KEY and/or OPENAI_API_KEY for AI features'))
  if (answers.deploymentPlatform === 'vercel') {
    console.log(pc.gray('  4. Set CRON_SECRET env var in Vercel for auto-draft security'))
  } else if (answers.deploymentPlatform === 'server') {
    console.log(pc.gray('  4. Schedule scripts/auto-draft.ts via crontab:'))
    console.log(pc.gray('     0 6 * * * cd /path/to/project && npx tsx scripts/auto-draft.ts'))
  }
  console.log('')
}
