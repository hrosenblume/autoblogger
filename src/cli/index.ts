import { init } from './init'
import { importContent } from './import'
import pc from 'picocolors'

const VERSION = '0.1.0'

const HELP = `
${pc.bold('autoblogger')} - CLI for setting up Autoblogger CMS

${pc.bold('Usage:')}
  npx autoblogger <command> [options]

${pc.bold('Commands:')}
  init              Set up Autoblogger in your Next.js project
  import <path>     Import markdown/MDX content into the database

${pc.bold('Init Options:')}
  --yes             Skip prompts and use defaults
  --skip-migrate    Don't run database migration
  --import=<path>   Import content from specified path after setup
  --dry-run         Show what would be done without making changes

${pc.bold('Import Options:')}
  --status=<status> Set imported posts status (draft, published) [default: draft]
  --tag=<tag>       Add a tag to all imported posts
  --dry-run         Show what would be imported without making changes

${pc.bold('Examples:')}
  npx autoblogger init
  npx autoblogger init --yes
  npx autoblogger init --import=./content/posts
  npx autoblogger import ./posts --status=draft
`

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  // Parse flags
  const flags = {
    yes: args.includes('--yes') || args.includes('-y'),
    skipMigrate: args.includes('--skip-migrate'),
    dryRun: args.includes('--dry-run'),
    help: args.includes('--help') || args.includes('-h'),
    version: args.includes('--version') || args.includes('-v'),
    import: args.find(a => a.startsWith('--import='))?.split('=')[1],
    status: args.find(a => a.startsWith('--status='))?.split('=')[1] as 'draft' | 'published' | undefined,
    tag: args.find(a => a.startsWith('--tag='))?.split('=')[1],
  }

  if (flags.version) {
    console.log(`autoblogger v${VERSION}`)
    process.exit(0)
  }

  if (flags.help || !command) {
    console.log(HELP)
    process.exit(0)
  }

  try {
    if (command === 'init') {
      await init({
        yes: flags.yes,
        skipMigrate: flags.skipMigrate,
        importPath: flags.import,
        dryRun: flags.dryRun,
      })
    } else if (command === 'import') {
      const path = args[1]
      if (!path) {
        console.error(pc.red('Error: Please specify a path to import from'))
        console.log('\nUsage: npx autoblogger import <path>')
        process.exit(1)
      }
      await importContent(path, {
        status: flags.status || 'draft',
        tag: flags.tag,
        dryRun: flags.dryRun,
      })
    } else {
      console.error(pc.red(`Unknown command: ${command}`))
      console.log(HELP)
      process.exit(1)
    }
  } catch (error) {
    console.error(pc.red('Error:'), error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
