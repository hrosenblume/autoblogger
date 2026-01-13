import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'
import pc from 'picocolors'
import { log } from './utils/prompts'

export interface ImportOptions {
  status?: 'draft' | 'published'
  tag?: string
  dryRun?: boolean
}

interface ParsedPost {
  title: string
  slug: string
  markdown: string
  subtitle?: string
  publishedAt?: Date
  tags?: string[]
  seoDescription?: string
}

function parseFrontmatter(content: string): { frontmatter: Record<string, unknown>; body: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)
  
  if (!match) {
    return { frontmatter: {}, body: content }
  }

  const frontmatterStr = match[1]
  const body = match[2]
  
  // YAML-like parsing with support for multi-line arrays
  const frontmatter: Record<string, unknown> = {}
  const lines = frontmatterStr.split('\n')
  
  let currentKey: string | null = null
  let currentArray: string[] | null = null
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Check for YAML list item (  - value)
    const listItemMatch = line.match(/^\s+-\s+(.+)$/)
    if (listItemMatch && currentKey && currentArray) {
      const item = listItemMatch[1].trim().replace(/^["']|["']$/g, '')
      currentArray.push(item)
      continue
    }
    
    // If we were building an array and hit a non-list line, save it
    if (currentKey && currentArray) {
      frontmatter[currentKey] = currentArray
      currentKey = null
      currentArray = null
    }
    
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue
    
    const key = line.slice(0, colonIndex).trim()
    let value: unknown = line.slice(colonIndex + 1).trim()
    
    // Empty value after colon might indicate a multi-line array
    if (value === '') {
      // Check if next line starts a YAML list
      const nextLine = lines[i + 1]
      if (nextLine && /^\s+-\s+/.test(nextLine)) {
        currentKey = key
        currentArray = []
        continue
      }
    }
    
    // Handle quoted strings
    if ((value as string).startsWith('"') && (value as string).endsWith('"')) {
      value = (value as string).slice(1, -1)
    } else if ((value as string).startsWith("'") && (value as string).endsWith("'")) {
      value = (value as string).slice(1, -1)
    }
    // Handle inline arrays like [tag1, tag2]
    else if ((value as string).startsWith('[') && (value as string).endsWith(']')) {
      const arrayStr = (value as string).slice(1, -1)
      value = arrayStr.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''))
    }
    // Handle booleans
    else if (value === 'true') {
      value = true
    } else if (value === 'false') {
      value = false
    }
    
    frontmatter[key] = value
  }
  
  // Don't forget to save any trailing array
  if (currentKey && currentArray) {
    frontmatter[currentKey] = currentArray
  }

  return { frontmatter, body }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseMarkdownFile(filePath: string): ParsedPost | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const { frontmatter, body } = parseFrontmatter(content)
    
    // Extract title from frontmatter or first heading
    let title = frontmatter.title as string | undefined
    if (!title) {
      const headingMatch = body.match(/^#\s+(.+)$/m)
      title = headingMatch ? headingMatch[1] : path.basename(filePath, path.extname(filePath))
    }
    
    // Generate slug from frontmatter, filename, or title
    const slug = (frontmatter.slug as string) || 
                 slugify(path.basename(filePath, path.extname(filePath))) ||
                 slugify(title)
    
    // Parse date
    let publishedAt: Date | undefined
    if (frontmatter.date) {
      const parsed = new Date(frontmatter.date as string)
      if (!isNaN(parsed.getTime())) {
        publishedAt = parsed
      }
    }
    
    // Extract tags
    let tags: string[] | undefined
    if (Array.isArray(frontmatter.tags)) {
      tags = frontmatter.tags as string[]
    } else if (typeof frontmatter.tags === 'string') {
      tags = [frontmatter.tags]
    }
    
    return {
      title,
      slug,
      markdown: body.trim(),
      subtitle: frontmatter.subtitle as string | undefined,
      publishedAt,
      tags,
      seoDescription: (frontmatter.description || frontmatter.excerpt) as string | undefined,
    }
  } catch (error) {
    console.error(pc.red(`Error parsing ${filePath}:`), error)
    return null
  }
}

function findMarkdownFiles(dir: string): string[] {
  const files: string[] = []
  
  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      
      if (entry.isDirectory()) {
        // Skip node_modules and hidden directories
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          walk(fullPath)
        }
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        files.push(fullPath)
      }
    }
  }
  
  walk(dir)
  return files
}

export async function importContent(dirPath: string, options: ImportOptions = {}) {
  const cwd = process.cwd()
  const absolutePath = path.isAbsolute(dirPath) ? dirPath : path.join(cwd, dirPath)
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Directory not found: ${dirPath}`)
  }
  
  // Find all markdown files
  const files = findMarkdownFiles(absolutePath)
  
  if (files.length === 0) {
    log('info', 'No markdown files found')
    return
  }
  
  log('info', `Found ${files.length} markdown files`)
  
  // Parse all files
  const posts: ParsedPost[] = []
  for (const file of files) {
    const post = parseMarkdownFile(file)
    if (post) {
      posts.push(post)
    }
  }
  
  if (options.dryRun) {
    console.log(pc.cyan('\n--- Dry run: would import the following posts ---\n'))
    for (const post of posts) {
      console.log(`  - ${post.title} (${post.slug})`)
    }
    console.log(pc.cyan('\n--- No changes made ---'))
    return
  }
  
  // Generate Prisma script to import posts
  const status = options.status || 'draft'
  const importScript = generateImportScript(posts, status, options.tag)
  
  // Write temporary script
  const scriptPath = path.join(cwd, '.autoblogger-import.mjs')
  fs.writeFileSync(scriptPath, importScript)
  
  try {
    // Run the import script
    execSync(`node ${scriptPath}`, {
      cwd,
      stdio: 'inherit',
    })
    log('check', `Imported ${posts.length} posts as ${status}`)
  } finally {
    // Clean up
    if (fs.existsSync(scriptPath)) {
      fs.unlinkSync(scriptPath)
    }
  }
}

function generateImportScript(posts: ParsedPost[], status: string, tag?: string): string {
  const postsData = JSON.stringify(posts.map(p => ({
    ...p,
    publishedAt: p.publishedAt?.toISOString(),
  })), null, 2)
  
  return `
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const posts = ${postsData}

async function main() {
  // Create tag if specified
  ${tag ? `
  let tagRecord = await prisma.tag.findUnique({ where: { name: '${tag}' } })
  if (!tagRecord) {
    tagRecord = await prisma.tag.create({ data: { name: '${tag}' } })
  }
  ` : ''}

  for (const post of posts) {
    // Check if slug already exists
    const existing = await prisma.post.findUnique({ where: { slug: post.slug } })
    if (existing) {
      console.log('  Skipped (exists):', post.title)
      continue
    }

    // Create post
    const created = await prisma.post.create({
      data: {
        title: post.title,
        slug: post.slug,
        markdown: post.markdown,
        subtitle: post.subtitle || null,
        status: '${status}',
        seoDescription: post.seoDescription || null,
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : ${status === 'published' ? 'new Date()' : 'null'},
      },
    })

    // Create tags if they exist
    if (post.tags && post.tags.length > 0) {
      for (const tagName of post.tags) {
        let tagRecord = await prisma.tag.findUnique({ where: { name: tagName } })
        if (!tagRecord) {
          tagRecord = await prisma.tag.create({ data: { name: tagName } })
        }
        await prisma.postTag.create({
          data: { postId: created.id, tagId: tagRecord.id },
        })
      }
    }

    ${tag ? `
    // Add specified tag
    await prisma.postTag.create({
      data: { postId: created.id, tagId: tagRecord.id },
    })
    ` : ''}

    console.log('  Imported:', post.title)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`
}
