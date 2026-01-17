import prompts from 'prompts'
import pc from 'picocolors'

export interface InitAnswers {
  dbProvider: 'postgresql' | 'sqlite' | 'mysql'
  runMigration: boolean
  importContent: boolean
  importPath?: string
  deploymentPlatform: 'vercel' | 'server' | 'skip'
}

export async function promptInit(options: {
  hasPrisma: boolean
  contentPaths: string[]
  contentCounts: Record<string, number>
}): Promise<InitAnswers> {
  const questions: prompts.PromptObject[] = []

  // Only ask for DB provider if no existing Prisma schema
  if (!options.hasPrisma) {
    questions.push({
      type: 'select',
      name: 'dbProvider',
      message: 'Database provider:',
      choices: [
        { title: 'PostgreSQL', value: 'postgresql' },
        { title: 'SQLite (for development)', value: 'sqlite' },
        { title: 'MySQL', value: 'mysql' },
      ],
      initial: 0,
    })
  }

  questions.push({
    type: 'confirm',
    name: 'runMigration',
    message: 'Run database migration after setup?',
    initial: true,
  })

  // Ask about deployment platform for auto-draft cron setup
  questions.push({
    type: 'select',
    name: 'deploymentPlatform',
    message: 'Where will you deploy? (for RSS auto-draft scheduling)',
    choices: [
      { title: 'Vercel (serverless)', value: 'vercel', description: 'Creates API route + vercel.json cron' },
      { title: 'Server (VPS/Docker)', value: 'server', description: 'Creates cron script for crontab' },
      { title: 'Skip for now', value: 'skip', description: 'Set up auto-draft later' },
    ],
    initial: 0,
  })

  // Ask about importing content if any was found
  if (options.contentPaths.length > 0) {
    const contentSummary = options.contentPaths
      .map(p => `${p} (${options.contentCounts[p]} files)`)
      .join(', ')
    
    console.log(pc.cyan(`\nFound existing content: ${contentSummary}`))
    
    questions.push({
      type: 'confirm',
      name: 'importContent',
      message: 'Import existing content?',
      initial: true,
    })

    if (options.contentPaths.length > 1) {
      questions.push({
        type: (prev) => prev ? 'select' : null,
        name: 'importPath',
        message: 'Which directory to import from?',
        choices: options.contentPaths.map(p => ({
          title: `${p} (${options.contentCounts[p]} files)`,
          value: p,
        })),
      })
    }
  }

  const answers = await prompts(questions, {
    onCancel: () => {
      console.log(pc.yellow('\nSetup cancelled'))
      process.exit(0)
    },
  })

  return {
    dbProvider: answers.dbProvider || 'postgresql',
    runMigration: answers.runMigration ?? true,
    importContent: answers.importContent ?? false,
    importPath: answers.importPath || options.contentPaths[0],
    deploymentPlatform: answers.deploymentPlatform || 'vercel',
  }
}

export async function confirm(message: string, initial = true): Promise<boolean> {
  const { confirmed } = await prompts({
    type: 'confirm',
    name: 'confirmed',
    message,
    initial,
  })
  return confirmed ?? false
}

export function log(type: 'check' | 'write' | 'run' | 'info' | 'warn' | 'error' | 'backup' | 'skip', message: string) {
  const icons: Record<typeof type, string> = {
    check: pc.green('✓'),
    write: pc.blue('→'),
    run: pc.cyan('$'),
    info: pc.cyan('ℹ'),
    warn: pc.yellow('⚠'),
    error: pc.red('✗'),
    backup: pc.magenta('⟳'),
    skip: pc.gray('○'),
  }
  console.log(`${icons[type]} ${message}`)
}
