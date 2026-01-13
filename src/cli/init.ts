import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import pc from 'picocolors'

import { detectProject, countMarkdownFiles } from './utils/detect'
import { createBackup } from './utils/backup'
import { checkConflicts, mergeSchema, writeSchema } from './utils/prisma-merge'
import { patchTailwindConfig, patchTailwindCssConfig, writeTailwindConfig } from './utils/tailwind-patch'
import { promptInit, log, confirm } from './utils/prompts'
import { CMS_CONFIG_TEMPLATE, API_ROUTE_TEMPLATE, DASHBOARD_PAGE_TEMPLATE } from './templates'
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

  if (project.hasTailwind) {
    log('check', `Found ${path.basename(project.tailwindConfigPath!)}`)
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

  // Step 2: Prompt for options (unless --yes)
  let answers: {
    dbProvider: 'postgresql' | 'sqlite' | 'mysql'
    runMigration: boolean
    importContent: boolean
    importPath?: string
  } = {
    dbProvider: 'postgresql',
    runMigration: !options.skipMigrate,
    importContent: !!options.importPath,
    importPath: options.importPath || project.contentPaths[0],
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
    console.log(`  - ${project.appRouterPath}/writer/[[...path]]/page.tsx`)
    if (project.tailwindConfigPath) {
      console.log(`  - ${project.tailwindConfigPath} (add content path)`)
    }
    
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
  if (project.tailwindConfigPath) filesToBackup.push(path.relative(cwd, project.tailwindConfigPath))
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

  // Dashboard page
  const dashboardPath = path.join(cwd, project.appRouterPath!, 'writer', '[[...path]]', 'page.tsx')
  if (fs.existsSync(dashboardPath)) {
    log('skip', `${project.appRouterPath}/writer/[[...path]]/page.tsx already exists`)
  } else {
    const dashboardDir = path.dirname(dashboardPath)
    if (!fs.existsSync(dashboardDir)) {
      fs.mkdirSync(dashboardDir, { recursive: true })
    }
    fs.writeFileSync(dashboardPath, DASHBOARD_PAGE_TEMPLATE)
    log('write', `Created ${project.appRouterPath}/writer/[[...path]]/page.tsx`)
  }

  // Step 7: Patch Tailwind config
  if (project.tailwindConfigPath) {
    // Traditional JS/TS config
    const patchResult = patchTailwindConfig(project.tailwindConfigPath)
    if (patchResult.alreadyPatched) {
      log('skip', 'Tailwind config already includes autoblogger')
    } else if (patchResult.success && patchResult.content) {
      writeTailwindConfig(project.tailwindConfigPath, patchResult.content)
      log('write', `Updated ${path.basename(project.tailwindConfigPath)}`)
    } else {
      log('warn', 'Could not auto-patch Tailwind config. Please add manually:')
      console.log(pc.gray("  content: ['./node_modules/autoblogger/dist/**/*.{js,mjs}']"))
    }
  } else if (project.tailwindCssPath) {
    // Tailwind v4 CSS-based config
    const patchResult = patchTailwindCssConfig(project.tailwindCssPath)
    if (patchResult.alreadyPatched) {
      log('skip', 'Tailwind CSS config already includes autoblogger')
    } else if (patchResult.success && patchResult.content) {
      writeTailwindConfig(project.tailwindCssPath, patchResult.content)
      log('write', `Updated ${path.basename(project.tailwindCssPath)} (Tailwind v4)`)
    } else {
      log('warn', 'Could not auto-patch Tailwind v4 CSS config. Please add manually:')
      console.log(pc.gray('  @source "./node_modules/autoblogger/dist/**/*.{js,mjs}";'))
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
  console.log(pc.gray('  2. Add your auth check to app/writer/[[...path]]/page.tsx'))
  console.log(pc.gray('  3. Set ANTHROPIC_API_KEY and/or OPENAI_API_KEY for AI features'))
  console.log('')
}
