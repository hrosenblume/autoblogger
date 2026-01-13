import * as fs from 'fs'
import * as path from 'path'

export interface ProjectInfo {
  isNextJs: boolean
  nextVersion?: string
  hasPrisma: boolean
  prismaSchemaPath?: string
  hasTailwind: boolean
  tailwindConfigPath?: string
  tailwindCssPath?: string  // For Tailwind v4 CSS-based config
  contentPaths: string[]
  appRouterPath?: string
}

const CONTENT_DIRS = ['content', 'posts', 'blog', 'articles', 'content/posts', 'content/blog']

export function detectProject(cwd: string = process.cwd()): ProjectInfo {
  const info: ProjectInfo = {
    isNextJs: false,
    hasPrisma: false,
    hasTailwind: false,
    contentPaths: [],
  }

  // Check package.json for Next.js
  const packageJsonPath = path.join(cwd, 'package.json')
  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
      const deps = { ...pkg.dependencies, ...pkg.devDependencies }
      
      if (deps.next) {
        info.isNextJs = true
        info.nextVersion = deps.next.replace(/[\^~]/g, '')
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Check for Prisma schema
  const prismaSchemaPath = path.join(cwd, 'prisma', 'schema.prisma')
  if (fs.existsSync(prismaSchemaPath)) {
    info.hasPrisma = true
    info.prismaSchemaPath = prismaSchemaPath
  }

  // Check for Tailwind config (JS/TS config files)
  const tailwindConfigs = [
    'tailwind.config.ts',
    'tailwind.config.js',
    'tailwind.config.mjs',
    'tailwind.config.cjs',
  ]
  for (const config of tailwindConfigs) {
    const configPath = path.join(cwd, config)
    if (fs.existsSync(configPath)) {
      info.hasTailwind = true
      info.tailwindConfigPath = configPath
      break
    }
  }

  // Check for Tailwind v4 CSS-based config
  if (!info.hasTailwind) {
    const cssConfigPaths = [
      'app/globals.css',
      'src/app/globals.css',
      'styles/globals.css',
      'app/app.css',
      'src/app/app.css',
    ]
    for (const cssPath of cssConfigPaths) {
      const fullPath = path.join(cwd, cssPath)
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8')
        if (content.includes('@import "tailwindcss"') || content.includes("@import 'tailwindcss'")) {
          info.hasTailwind = true
          info.tailwindCssPath = fullPath
          break
        }
      }
    }
  }

  // Check for App Router
  const appDirPath = path.join(cwd, 'app')
  const srcAppDirPath = path.join(cwd, 'src', 'app')
  if (fs.existsSync(appDirPath)) {
    info.appRouterPath = 'app'
  } else if (fs.existsSync(srcAppDirPath)) {
    info.appRouterPath = 'src/app'
  }

  // Detect content directories
  for (const dir of CONTENT_DIRS) {
    const dirPath = path.join(cwd, dir)
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      // Check if it has markdown files
      const files = fs.readdirSync(dirPath)
      const hasMarkdown = files.some(f => f.endsWith('.md') || f.endsWith('.mdx'))
      if (hasMarkdown) {
        info.contentPaths.push(dir)
      }
    }
  }

  return info
}

export function countMarkdownFiles(dirPath: string): number {
  if (!fs.existsSync(dirPath)) return 0
  
  let count = 0
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      count += countMarkdownFiles(fullPath)
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
      count++
    }
  }
  
  return count
}
