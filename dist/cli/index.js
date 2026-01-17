#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/cli/init.ts
var fs6 = __toESM(require("fs"));
var path6 = __toESM(require("path"));
var import_child_process2 = require("child_process");
var import_picocolors3 = __toESM(require("picocolors"));

// src/cli/utils/detect.ts
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));
var CONTENT_DIRS = ["content", "posts", "blog", "articles", "content/posts", "content/blog"];
function detectProject(cwd = process.cwd()) {
  const info = {
    isNextJs: false,
    hasPrisma: false,
    hasTailwind: false,
    contentPaths: []
  };
  const packageJsonPath = path.join(cwd, "package.json");
  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps.next) {
        info.isNextJs = true;
        info.nextVersion = deps.next.replace(/[\^~]/g, "");
      }
    } catch {
    }
  }
  const prismaSchemaPath = path.join(cwd, "prisma", "schema.prisma");
  if (fs.existsSync(prismaSchemaPath)) {
    info.hasPrisma = true;
    info.prismaSchemaPath = prismaSchemaPath;
  }
  const tailwindConfigs = [
    "tailwind.config.ts",
    "tailwind.config.js",
    "tailwind.config.mjs",
    "tailwind.config.cjs"
  ];
  for (const config of tailwindConfigs) {
    const configPath = path.join(cwd, config);
    if (fs.existsSync(configPath)) {
      info.hasTailwind = true;
      info.tailwindConfigPath = configPath;
      break;
    }
  }
  if (!info.hasTailwind) {
    const cssConfigPaths = [
      "app/globals.css",
      "src/app/globals.css",
      "styles/globals.css",
      "app/app.css",
      "src/app/app.css"
    ];
    for (const cssPath of cssConfigPaths) {
      const fullPath = path.join(cwd, cssPath);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        if (content.includes('@import "tailwindcss"') || content.includes("@import 'tailwindcss'")) {
          info.hasTailwind = true;
          info.tailwindCssPath = fullPath;
          break;
        }
      }
    }
  }
  const appDirPath = path.join(cwd, "app");
  const srcAppDirPath = path.join(cwd, "src", "app");
  if (fs.existsSync(appDirPath)) {
    info.appRouterPath = "app";
  } else if (fs.existsSync(srcAppDirPath)) {
    info.appRouterPath = "src/app";
  }
  for (const dir of CONTENT_DIRS) {
    const dirPath = path.join(cwd, dir);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      const files = fs.readdirSync(dirPath);
      const hasMarkdown = files.some((f) => f.endsWith(".md") || f.endsWith(".mdx"));
      if (hasMarkdown) {
        info.contentPaths.push(dir);
      }
    }
  }
  return info;
}
function countMarkdownFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  let count = 0;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      count += countMarkdownFiles(fullPath);
    } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
      count++;
    }
  }
  return count;
}

// src/cli/utils/backup.ts
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));
var BACKUP_DIR = ".autoblogger-backup";
function createBackup(files, cwd = process.cwd()) {
  const backupPath = path2.join(cwd, BACKUP_DIR);
  if (!fs2.existsSync(backupPath)) {
    fs2.mkdirSync(backupPath, { recursive: true });
  }
  const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
  const timestampedBackupPath = path2.join(backupPath, timestamp);
  fs2.mkdirSync(timestampedBackupPath, { recursive: true });
  for (const file of files) {
    const sourcePath = path2.join(cwd, file);
    if (fs2.existsSync(sourcePath)) {
      const destPath = path2.join(timestampedBackupPath, file);
      const destDir = path2.dirname(destPath);
      if (!fs2.existsSync(destDir)) {
        fs2.mkdirSync(destDir, { recursive: true });
      }
      fs2.copyFileSync(sourcePath, destPath);
    }
  }
  return timestampedBackupPath;
}

// src/cli/utils/prisma-merge.ts
var fs3 = __toESM(require("fs"));
var path3 = __toESM(require("path"));
var AUTOBLOGGER_MODELS = `
// ==========================================
// AUTOBLOGGER MODELS
// ==========================================

model Post {
  id          String    @id @default(uuid())
  title       String
  subtitle    String?
  slug        String    @unique
  markdown    String
  status      String    @default("draft") // draft, published, suggested, deleted
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  publishedAt DateTime?

  // SEO fields
  seoTitle       String?
  seoDescription String?
  seoKeywords    String?
  noIndex        Boolean  @default(false)
  ogImage        String?

  // Preview
  previewToken  String?   @unique
  previewExpiry DateTime?

  // Relations
  revisions Revision[]
  tags      PostTag[]
  comments  Comment[]
  newsItem  NewsItem?

  // Auto-draft
  sourceUrl String?
  topicId   String?
  topic     TopicSubscription? @relation(fields: [topicId], references: [id])
}

model Revision {
  id        String   @id @default(uuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  title     String?
  subtitle  String?
  markdown  String
  createdAt DateTime @default(now())
}

model Comment {
  id        String   @id @default(uuid())
  postId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)

  // For authenticated comments (editor comments)
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])

  // For public comments (legacy)
  authorId    String?
  authorName  String?
  authorEmail String?

  // Editor comment fields
  quotedText String   @default("")
  content    String
  parentId   String?
  parent     Comment? @relation("Replies", fields: [parentId], references: [id], onDelete: Cascade)
  replies    Comment[] @relation("Replies")
  resolved   Boolean  @default(false)
  deletedAt  DateTime?

  // Legacy field
  approved  Boolean  @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([postId])
  @@index([parentId])
}

model User {
  id        String    @id @default(uuid())
  email     String    @unique
  name      String?
  role      String    @default("writer")
  createdAt DateTime  @default(now())
  comments  Comment[]
}

model Tag {
  id        String    @id @default(uuid())
  name      String    @unique
  createdAt DateTime  @default(now())
  posts     PostTag[]
}

model PostTag {
  id        String   @id @default(uuid())
  postId    String
  tagId     String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([postId, tagId])
}

model AISettings {
  id                 String   @id @default("default")
  rules              String   @default("")
  chatRules          String   @default("")
  rewriteRules       String?
  autoDraftRules     String?
  planRules          String?
  defaultModel       String   @default("claude-sonnet")
  autoDraftWordCount Int      @default(800)
  generateTemplate   String?
  chatTemplate       String?
  rewriteTemplate    String?
  autoDraftTemplate  String?
  planTemplate       String?
  expandPlanTemplate String?
  anthropicKey       String?
  openaiKey          String?
  updatedAt          DateTime @updatedAt
}

model IntegrationSettings {
  id               String   @id @default("default")
  autoDraftEnabled Boolean  @default(false)
  postUrlPattern   String   @default("/e/{slug}")
  updatedAt        DateTime @updatedAt
}

model TopicSubscription {
  id               String    @id @default(uuid())
  name             String
  keywords         String
  rssFeeds         String
  isActive         Boolean   @default(true)
  useKeywordFilter Boolean   @default(true)
  frequency        String    @default("daily")
  maxPerPeriod     Int       @default(3)
  essayFocus       String?
  lastRunAt        DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  posts            Post[]
  newsItems        NewsItem[]
}

model NewsItem {
  id          String             @id @default(uuid())
  topicId     String
  topic       TopicSubscription  @relation(fields: [topicId], references: [id], onDelete: Cascade)
  url         String             @unique
  title       String
  summary     String?
  publishedAt DateTime?
  status      String             @default("pending")
  postId      String?            @unique
  post        Post?              @relation(fields: [postId], references: [id])
  createdAt   DateTime           @default(now())
}
`;
var AUTOBLOGGER_MODEL_NAMES = [
  "Post",
  "Revision",
  "Comment",
  "User",
  "Tag",
  "PostTag",
  "AISettings",
  "IntegrationSettings",
  "TopicSubscription",
  "NewsItem"
];
function extractModelNames(schemaContent) {
  const modelRegex = /model\s+(\w+)\s*\{/g;
  const models = [];
  let match;
  while ((match = modelRegex.exec(schemaContent)) !== null) {
    models.push(match[1]);
  }
  return models;
}
function checkConflicts(schemaPath) {
  if (!fs3.existsSync(schemaPath)) {
    return [];
  }
  const content = fs3.readFileSync(schemaPath, "utf-8");
  const existingModels = extractModelNames(content);
  return AUTOBLOGGER_MODEL_NAMES.filter((model) => existingModels.includes(model));
}
function mergeSchema(schemaPath, dbProvider) {
  const conflicts = checkConflicts(schemaPath);
  if (conflicts.length > 0) {
    return {
      success: false,
      conflicts
    };
  }
  let content;
  if (fs3.existsSync(schemaPath)) {
    const existing = fs3.readFileSync(schemaPath, "utf-8");
    content = existing.trimEnd() + "\n" + AUTOBLOGGER_MODELS;
  } else {
    const provider = dbProvider || "postgresql";
    content = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "${provider}"
  url      = env("DATABASE_URL")
}
${AUTOBLOGGER_MODELS}`;
  }
  return {
    success: true,
    conflicts: [],
    content
  };
}
function writeSchema(schemaPath, content) {
  const dir = path3.dirname(schemaPath);
  if (!fs3.existsSync(dir)) {
    fs3.mkdirSync(dir, { recursive: true });
  }
  fs3.writeFileSync(schemaPath, content, "utf-8");
}

// src/cli/utils/css-patch.ts
var fs4 = __toESM(require("fs"));
var path4 = __toESM(require("path"));
var AUTOBLOGGER_CSS_IMPORT = "@import 'autoblogger/styles/standalone.css';";
function findGlobalsCss(projectRoot) {
  const candidates = [
    "app/globals.css",
    "src/app/globals.css",
    "styles/globals.css",
    "src/styles/globals.css",
    "app/global.css",
    "src/app/global.css"
  ];
  for (const candidate of candidates) {
    const fullPath = path4.join(projectRoot, candidate);
    if (fs4.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}
function patchGlobalsCss(cssPath) {
  if (!fs4.existsSync(cssPath)) {
    return { success: false, alreadyPatched: false };
  }
  let content = fs4.readFileSync(cssPath, "utf-8");
  if (content.includes("autoblogger")) {
    return { success: true, alreadyPatched: true, filePath: cssPath };
  }
  content = AUTOBLOGGER_CSS_IMPORT + "\n\n" + content;
  fs4.writeFileSync(cssPath, content, "utf-8");
  return { success: true, alreadyPatched: false, filePath: cssPath };
}

// src/cli/utils/prompts.ts
var import_prompts = __toESM(require("prompts"));
var import_picocolors = __toESM(require("picocolors"));
async function promptInit(options) {
  const questions = [];
  if (!options.hasPrisma) {
    questions.push({
      type: "select",
      name: "dbProvider",
      message: "Database provider:",
      choices: [
        { title: "PostgreSQL", value: "postgresql" },
        { title: "SQLite (for development)", value: "sqlite" },
        { title: "MySQL", value: "mysql" }
      ],
      initial: 0
    });
  }
  questions.push({
    type: "confirm",
    name: "runMigration",
    message: "Run database migration after setup?",
    initial: true
  });
  questions.push({
    type: "select",
    name: "deploymentPlatform",
    message: "Where will you deploy? (for RSS auto-draft scheduling)",
    choices: [
      { title: "Vercel (serverless)", value: "vercel", description: "Creates API route + vercel.json cron" },
      { title: "Server (VPS/Docker)", value: "server", description: "Creates cron script for crontab" },
      { title: "Skip for now", value: "skip", description: "Set up auto-draft later" }
    ],
    initial: 0
  });
  if (options.contentPaths.length > 0) {
    const contentSummary = options.contentPaths.map((p) => `${p} (${options.contentCounts[p]} files)`).join(", ");
    console.log(import_picocolors.default.cyan(`
Found existing content: ${contentSummary}`));
    questions.push({
      type: "confirm",
      name: "importContent",
      message: "Import existing content?",
      initial: true
    });
    if (options.contentPaths.length > 1) {
      questions.push({
        type: (prev) => prev ? "select" : null,
        name: "importPath",
        message: "Which directory to import from?",
        choices: options.contentPaths.map((p) => ({
          title: `${p} (${options.contentCounts[p]} files)`,
          value: p
        }))
      });
    }
  }
  const answers = await (0, import_prompts.default)(questions, {
    onCancel: () => {
      console.log(import_picocolors.default.yellow("\nSetup cancelled"));
      process.exit(0);
    }
  });
  return {
    dbProvider: answers.dbProvider || "postgresql",
    runMigration: answers.runMigration ?? true,
    importContent: answers.importContent ?? false,
    importPath: answers.importPath || options.contentPaths[0],
    deploymentPlatform: answers.deploymentPlatform || "vercel"
  };
}
async function confirm(message, initial = true) {
  const { confirmed } = await (0, import_prompts.default)({
    type: "confirm",
    name: "confirmed",
    message,
    initial
  });
  return confirmed ?? false;
}
function log(type, message) {
  const icons = {
    check: import_picocolors.default.green("\u2713"),
    write: import_picocolors.default.blue("\u2192"),
    run: import_picocolors.default.cyan("$"),
    info: import_picocolors.default.cyan("\u2139"),
    warn: import_picocolors.default.yellow("\u26A0"),
    error: import_picocolors.default.red("\u2717"),
    backup: import_picocolors.default.magenta("\u27F3"),
    skip: import_picocolors.default.gray("\u25CB")
  };
  console.log(`${icons[type]} ${message}`);
}

// src/cli/templates/cms-config.ts
var CMS_CONFIG_TEMPLATE = `import { createAutoblogger } from 'autoblogger'

// TODO: Update this import to match your Prisma client location
// Common locations:
//   import { prisma } from '@/lib/db'
//   import { prisma } from '@/lib/prisma'
//   import { db as prisma } from '@/server/db'
//   import prisma from '@/lib/prisma'
//
// If you don't have a Prisma client file yet, create one:
//   // lib/db.ts
//   import { PrismaClient } from '@prisma/client'
//   export const prisma = new PrismaClient()
import { prisma } from '@/lib/db'

// TODO: Import your auth function
// import { auth } from '@/lib/auth'

export const cms = createAutoblogger({
  // Required: Your Prisma client instance
  prisma,
  
  // Required: Authentication configuration
  auth: {
    // TODO: Replace with your auth function
    getSession: async () => {
      // Example for NextAuth:
      // return auth()
      
      // For now, return a mock session (remove in production!)
      return {
        user: {
          id: 'user-1',
          email: 'admin@example.com',
          name: 'Admin',
          role: 'admin',
        }
      }
    },
    
    // Check if user is an admin
    isAdmin: (session) => session?.user?.role === 'admin',
    
    // Check if user can publish posts
    canPublish: (session) => ['admin', 'writer'].includes(session?.user?.role ?? ''),
  },
  
  // Optional: AI configuration
  ai: {
    anthropicKey: process.env.ANTHROPIC_API_KEY,
    openaiKey: process.env.OPENAI_API_KEY,
  },
  
  // Optional: File upload handler
  // storage: {
  //   upload: async (file: File) => {
  //     const url = await uploadToYourStorage(file)
  //     return { url }
  //   }
  // },
})
`;

// src/cli/templates/api-route.ts
var API_ROUTE_TEMPLATE = `import { cms } from '@/lib/cms'
import { NextRequest } from 'next/server'

async function handler(
  req: NextRequest, 
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  return cms.handleRequest(req, path.join('/'))
}

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE }
`;

// src/cli/templates/dashboard-page.ts
var DASHBOARD_PAGE_TEMPLATE = `import { AutobloggerDashboard } from 'autoblogger/ui'
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
`;

// src/cli/templates/writer-layout.ts
var WRITER_LAYOUT_TEMPLATE = `export default function WriterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
`;

// src/cli/templates/auto-draft-script.ts
var AUTO_DRAFT_SCRIPT_TEMPLATE = `/**
 * Auto-Draft Cron Script
 * 
 * Fetches RSS feeds for active topic subscriptions and generates essay drafts.
 * Run with: npx tsx --env-file=.env.local scripts/auto-draft.ts
 * 
 * Schedule via cron:
 *   0 6 * * * cd /path/to/project && npx tsx scripts/auto-draft.ts >> /var/log/auto-draft.log 2>&1
 */

import 'dotenv/config'
import { cms } from '../lib/cms'

async function main() {
  const startTime = new Date()
  console.log(\`[\${startTime.toISOString()}] Starting auto-draft...\`)
  
  try {
    const results = await cms.autoDraft.run()
    
    if (results.length === 0) {
      console.log('  No active topics to process.')
    } else {
      let totalGenerated = 0
      let totalSkipped = 0
      
      for (const r of results) {
        console.log(\`  \${r.topicName}: generated \${r.generated}, skipped \${r.skipped}\`)
        totalGenerated += r.generated
        totalSkipped += r.skipped
      }
      
      console.log('  ---')
      console.log(\`  Total: \${totalGenerated} essays generated, \${totalSkipped} articles skipped\`)
    }
    
    const endTime = new Date()
    const duration = (endTime.getTime() - startTime.getTime()) / 1000
    console.log(\`[\${endTime.toISOString()}] Done in \${duration.toFixed(1)}s\`)
    
    process.exit(0)
  } catch (error) {
    console.error('Auto-draft failed:', error)
    process.exit(1)
  }
}

main()
`;

// src/cli/templates/vercel-cron-route.ts
var VERCEL_CRON_ROUTE_TEMPLATE = `import { NextResponse } from 'next/server'
import { cms } from '@/lib/cms'

/**
 * Vercel Cron endpoint for RSS auto-draft generation.
 * 
 * Triggered by Vercel Cron on schedule defined in vercel.json.
 * Fetches RSS feeds for active topic subscriptions and generates essay drafts.
 * 
 * To test manually:
 *   curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/auto-draft
 */
export async function GET(request: Request) {
  // Verify the request is from Vercel Cron (security)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== \`Bearer \${process.env.CRON_SECRET}\`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = new Date()
  console.log(\`[\${startTime.toISOString()}] Starting auto-draft via Vercel Cron...\`)

  try {
    const results = await cms.autoDraft.run()

    if (results.length === 0) {
      console.log('  No active topics to process.')
    } else {
      let totalGenerated = 0
      let totalSkipped = 0

      for (const r of results) {
        console.log(\`  \${r.topicName}: generated \${r.generated}, skipped \${r.skipped}\`)
        totalGenerated += r.generated
        totalSkipped += r.skipped
      }

      console.log('  ---')
      console.log(\`  Total: \${totalGenerated} essays generated, \${totalSkipped} articles skipped\`)
    }

    const endTime = new Date()
    const duration = (endTime.getTime() - startTime.getTime()) / 1000
    console.log(\`[\${endTime.toISOString()}] Done in \${duration.toFixed(1)}s\`)

    return NextResponse.json({
      success: true,
      results,
      duration: \`\${duration.toFixed(1)}s\`,
    })
  } catch (error) {
    console.error('Auto-draft failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Auto-draft failed' },
      { status: 500 }
    )
  }
}

// Vercel Cron requires a longer timeout for AI generation
export const maxDuration = 300 // 5 minutes
`;

// src/cli/import.ts
var fs5 = __toESM(require("fs"));
var path5 = __toESM(require("path"));
var import_child_process = require("child_process");
var import_picocolors2 = __toESM(require("picocolors"));
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  if (!match) {
    return { frontmatter: {}, body: content };
  }
  const frontmatterStr = match[1];
  const body = match[2];
  const frontmatter = {};
  const lines = frontmatterStr.split("\n");
  let currentKey = null;
  let currentArray = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const listItemMatch = line.match(/^\s+-\s+(.+)$/);
    if (listItemMatch && currentKey && currentArray) {
      const item = listItemMatch[1].trim().replace(/^["']|["']$/g, "");
      currentArray.push(item);
      continue;
    }
    if (currentKey && currentArray) {
      frontmatter[currentKey] = currentArray;
      currentKey = null;
      currentArray = null;
    }
    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    let value = line.slice(colonIndex + 1).trim();
    if (value === "") {
      const nextLine = lines[i + 1];
      if (nextLine && /^\s+-\s+/.test(nextLine)) {
        currentKey = key;
        currentArray = [];
        continue;
      }
    }
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1);
    } else if (value.startsWith("[") && value.endsWith("]")) {
      const arrayStr = value.slice(1, -1);
      value = arrayStr.split(",").map((s) => s.trim().replace(/^["']|["']$/g, ""));
    } else if (value === "true") {
      value = true;
    } else if (value === "false") {
      value = false;
    }
    frontmatter[key] = value;
  }
  if (currentKey && currentArray) {
    frontmatter[currentKey] = currentArray;
  }
  return { frontmatter, body };
}
function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
function parseMarkdownFile(filePath) {
  try {
    const content = fs5.readFileSync(filePath, "utf-8");
    const { frontmatter, body } = parseFrontmatter(content);
    let title = frontmatter.title;
    if (!title) {
      const headingMatch = body.match(/^#\s+(.+)$/m);
      title = headingMatch ? headingMatch[1] : path5.basename(filePath, path5.extname(filePath));
    }
    const slug = frontmatter.slug || slugify(path5.basename(filePath, path5.extname(filePath))) || slugify(title);
    let publishedAt;
    if (frontmatter.date) {
      const parsed = new Date(frontmatter.date);
      if (!isNaN(parsed.getTime())) {
        publishedAt = parsed;
      }
    }
    let tags;
    if (Array.isArray(frontmatter.tags)) {
      tags = frontmatter.tags;
    } else if (typeof frontmatter.tags === "string") {
      tags = [frontmatter.tags];
    }
    return {
      title,
      slug,
      markdown: body.trim(),
      subtitle: frontmatter.subtitle,
      publishedAt,
      tags,
      seoDescription: frontmatter.description || frontmatter.excerpt
    };
  } catch (error) {
    console.error(import_picocolors2.default.red(`Error parsing ${filePath}:`), error);
    return null;
  }
}
function findMarkdownFiles(dir) {
  const files = [];
  function walk(currentDir) {
    const entries = fs5.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path5.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
          walk(fullPath);
        }
      } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
        files.push(fullPath);
      }
    }
  }
  walk(dir);
  return files;
}
async function importContent(dirPath, options = {}) {
  const cwd = process.cwd();
  const absolutePath = path5.isAbsolute(dirPath) ? dirPath : path5.join(cwd, dirPath);
  if (!fs5.existsSync(absolutePath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }
  const files = findMarkdownFiles(absolutePath);
  if (files.length === 0) {
    log("info", "No markdown files found");
    return;
  }
  log("info", `Found ${files.length} markdown files`);
  const posts = [];
  for (const file of files) {
    const post = parseMarkdownFile(file);
    if (post) {
      posts.push(post);
    }
  }
  if (options.dryRun) {
    console.log(import_picocolors2.default.cyan("\n--- Dry run: would import the following posts ---\n"));
    for (const post of posts) {
      console.log(`  - ${post.title} (${post.slug})`);
    }
    console.log(import_picocolors2.default.cyan("\n--- No changes made ---"));
    return;
  }
  const status = options.status || "draft";
  const importScript = generateImportScript(posts, status, options.tag);
  const scriptPath = path5.join(cwd, ".autoblogger-import.mjs");
  fs5.writeFileSync(scriptPath, importScript);
  try {
    (0, import_child_process.execSync)(`node ${scriptPath}`, {
      cwd,
      stdio: "inherit"
    });
    log("check", `Imported ${posts.length} posts as ${status}`);
  } finally {
    if (fs5.existsSync(scriptPath)) {
      fs5.unlinkSync(scriptPath);
    }
  }
}
function generateImportScript(posts, status, tag) {
  const postsData = JSON.stringify(posts.map((p) => ({
    ...p,
    publishedAt: p.publishedAt?.toISOString()
  })), null, 2);
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
  ` : ""}

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
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : ${status === "published" ? "new Date()" : "null"},
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
    ` : ""}

    console.log('  Imported:', post.title)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
`;
}

// src/cli/init.ts
async function init(options = {}) {
  const cwd = process.cwd();
  console.log(import_picocolors3.default.bold("\nSetting up Autoblogger...\n"));
  const project = detectProject(cwd);
  if (!project.isNextJs) {
    console.log(import_picocolors3.default.yellow("Warning: This does not appear to be a Next.js project."));
    if (!options.yes) {
      const proceed = await confirm("Continue anyway?", false);
      if (!proceed) {
        console.log("Setup cancelled.");
        return;
      }
    }
  } else {
    log("check", `Detected Next.js ${project.nextVersion || ""} project`);
  }
  if (project.hasPrisma) {
    log("check", `Found ${project.prismaSchemaPath}`);
  }
  if (!project.appRouterPath) {
    console.log(import_picocolors3.default.red("Error: Could not find App Router (app/ or src/app/ directory)"));
    console.log("Autoblogger requires Next.js App Router.");
    return;
  }
  const contentCounts = {};
  for (const contentPath of project.contentPaths) {
    contentCounts[contentPath] = countMarkdownFiles(path6.join(cwd, contentPath));
  }
  const hasVercelJson = fs6.existsSync(path6.join(cwd, "vercel.json"));
  const hasVercelDir = fs6.existsSync(path6.join(cwd, ".vercel"));
  const isLikelyVercel = hasVercelJson || hasVercelDir;
  let answers = {
    dbProvider: "postgresql",
    runMigration: !options.skipMigrate,
    importContent: !!options.importPath,
    importPath: options.importPath || project.contentPaths[0],
    deploymentPlatform: isLikelyVercel ? "vercel" : "server"
  };
  if (!options.yes) {
    answers = await promptInit({
      hasPrisma: project.hasPrisma,
      contentPaths: project.contentPaths,
      contentCounts
    });
  } else if (project.contentPaths.length > 0 && !options.importPath) {
    answers.importContent = true;
    answers.importPath = project.contentPaths[0];
  }
  const prismaPath = project.prismaSchemaPath || path6.join(cwd, "prisma", "schema.prisma");
  const conflicts = checkConflicts(prismaPath);
  if (conflicts.length > 0) {
    console.log(import_picocolors3.default.red(`
Error: Found conflicting model names in your Prisma schema:`));
    conflicts.forEach((c) => console.log(import_picocolors3.default.red(`  - ${c}`)));
    console.log("\nPlease rename these models before running autoblogger init.");
    return;
  }
  log("check", "No model conflicts found");
  if (options.dryRun) {
    console.log(import_picocolors3.default.cyan("\n--- Dry run mode: showing what would be done ---\n"));
    console.log("Would create/update:");
    console.log(`  - ${prismaPath} (add 11 models)`);
    console.log(`  - lib/cms.ts`);
    console.log(`  - ${project.appRouterPath}/api/cms/[...path]/route.ts`);
    console.log(`  - ${project.appRouterPath}/(writer)/writer/[[...path]]/page.tsx`);
    console.log(`  - ${project.appRouterPath}/(writer)/layout.tsx`);
    if (answers.deploymentPlatform === "vercel") {
      console.log(`  - ${project.appRouterPath}/api/cron/auto-draft/route.ts (Vercel Cron endpoint)`);
      console.log(`  - vercel.json (add cron schedule)`);
    } else if (answers.deploymentPlatform === "server") {
      console.log(`  - scripts/auto-draft.ts (cron script for crontab)`);
    }
    console.log(`  - globals.css (add CSS import)`);
    console.log(`  - ${project.appRouterPath}/layout.tsx (add suppressHydrationWarning, GlobalShortcuts)`);
    if (answers.runMigration) {
      console.log("\nWould run:");
      console.log("  - npx prisma migrate dev --name add-autoblogger");
      console.log("  - npx prisma generate");
    }
    if (answers.importContent && answers.importPath) {
      const count = contentCounts[answers.importPath] || countMarkdownFiles(path6.join(cwd, answers.importPath));
      console.log(`
Would import ${count} posts from ${answers.importPath}`);
    }
    console.log(import_picocolors3.default.cyan("\n--- No changes made ---"));
    return;
  }
  const filesToBackup = [];
  if (project.hasPrisma) filesToBackup.push("prisma/schema.prisma");
  if (fs6.existsSync(path6.join(cwd, "lib", "cms.ts"))) filesToBackup.push("lib/cms.ts");
  if (filesToBackup.length > 0) {
    const backupPath = createBackup(filesToBackup, cwd);
    log("backup", `Created backup at ${path6.relative(cwd, backupPath)}`);
  }
  const mergeResult = mergeSchema(prismaPath, answers.dbProvider);
  if (!mergeResult.success) {
    console.log(import_picocolors3.default.red("Error: Failed to merge Prisma schema"));
    return;
  }
  writeSchema(prismaPath, mergeResult.content);
  log("write", `Updated ${path6.relative(cwd, prismaPath)} (added 11 models)`);
  const libDir = path6.join(cwd, "lib");
  const cmsConfigPath = path6.join(libDir, "cms.ts");
  if (fs6.existsSync(cmsConfigPath)) {
    log("skip", "lib/cms.ts already exists");
  } else {
    if (!fs6.existsSync(libDir)) {
      fs6.mkdirSync(libDir, { recursive: true });
    }
    fs6.writeFileSync(cmsConfigPath, CMS_CONFIG_TEMPLATE);
    log("write", "Created lib/cms.ts");
  }
  const apiRoutePath = path6.join(cwd, project.appRouterPath, "api", "cms", "[...path]", "route.ts");
  if (fs6.existsSync(apiRoutePath)) {
    log("skip", `${project.appRouterPath}/api/cms/[...path]/route.ts already exists`);
  } else {
    const apiRouteDir = path6.dirname(apiRoutePath);
    if (!fs6.existsSync(apiRouteDir)) {
      fs6.mkdirSync(apiRouteDir, { recursive: true });
    }
    fs6.writeFileSync(apiRoutePath, API_ROUTE_TEMPLATE);
    log("write", `Created ${project.appRouterPath}/api/cms/[...path]/route.ts`);
  }
  const writerRouteGroup = path6.join(cwd, project.appRouterPath, "(writer)");
  const dashboardPath = path6.join(writerRouteGroup, "writer", "[[...path]]", "page.tsx");
  const writerLayoutPath = path6.join(writerRouteGroup, "layout.tsx");
  if (fs6.existsSync(dashboardPath)) {
    log("skip", `${project.appRouterPath}/(writer)/writer/[[...path]]/page.tsx already exists`);
  } else {
    const dashboardDir = path6.dirname(dashboardPath);
    if (!fs6.existsSync(dashboardDir)) {
      fs6.mkdirSync(dashboardDir, { recursive: true });
    }
    fs6.writeFileSync(dashboardPath, DASHBOARD_PAGE_TEMPLATE);
    log("write", `Created ${project.appRouterPath}/(writer)/writer/[[...path]]/page.tsx`);
  }
  if (fs6.existsSync(writerLayoutPath)) {
    log("skip", `${project.appRouterPath}/(writer)/layout.tsx already exists`);
  } else {
    fs6.writeFileSync(writerLayoutPath, WRITER_LAYOUT_TEMPLATE);
    log("write", `Created ${project.appRouterPath}/(writer)/layout.tsx`);
  }
  if (answers.deploymentPlatform === "vercel") {
    const cronRoutePath = path6.join(cwd, project.appRouterPath, "api", "cron", "auto-draft", "route.ts");
    if (fs6.existsSync(cronRoutePath)) {
      log("skip", `${project.appRouterPath}/api/cron/auto-draft/route.ts already exists`);
    } else {
      const cronRouteDir = path6.dirname(cronRoutePath);
      if (!fs6.existsSync(cronRouteDir)) {
        fs6.mkdirSync(cronRouteDir, { recursive: true });
      }
      fs6.writeFileSync(cronRoutePath, VERCEL_CRON_ROUTE_TEMPLATE);
      log("write", `Created ${project.appRouterPath}/api/cron/auto-draft/route.ts`);
    }
    const vercelJsonPath = path6.join(cwd, "vercel.json");
    let vercelConfig = {};
    if (fs6.existsSync(vercelJsonPath)) {
      try {
        vercelConfig = JSON.parse(fs6.readFileSync(vercelJsonPath, "utf-8"));
      } catch {
      }
    }
    const cronPath = "/api/cron/auto-draft";
    const existingCron = vercelConfig.crons?.find((c) => c.path === cronPath);
    if (existingCron) {
      log("skip", "vercel.json already has auto-draft cron");
    } else {
      vercelConfig.crons = vercelConfig.crons || [];
      vercelConfig.crons.push({
        path: cronPath,
        schedule: "0 6 * * *"
        // Daily at 6am UTC
      });
      fs6.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2) + "\n");
      log("write", "Updated vercel.json with auto-draft cron (daily at 6am UTC)");
    }
  } else if (answers.deploymentPlatform === "server") {
    const scriptsDir = path6.join(cwd, "scripts");
    const autoDraftScriptPath = path6.join(scriptsDir, "auto-draft.ts");
    if (fs6.existsSync(autoDraftScriptPath)) {
      log("skip", "scripts/auto-draft.ts already exists");
    } else {
      if (!fs6.existsSync(scriptsDir)) {
        fs6.mkdirSync(scriptsDir, { recursive: true });
      }
      fs6.writeFileSync(autoDraftScriptPath, AUTO_DRAFT_SCRIPT_TEMPLATE);
      log("write", "Created scripts/auto-draft.ts (schedule via crontab)");
    }
  }
  const globalsCssPath = findGlobalsCss(cwd);
  if (globalsCssPath) {
    const cssResult = patchGlobalsCss(globalsCssPath);
    if (cssResult.alreadyPatched) {
      log("skip", "globals.css already imports autoblogger styles");
    } else if (cssResult.success) {
      log("write", `Updated ${path6.relative(cwd, globalsCssPath)} (added autoblogger CSS import)`);
    }
  } else {
    log("warn", "Could not find globals.css. Please add manually:");
    console.log(import_picocolors3.default.gray("  @import 'autoblogger/styles/standalone.css';"));
  }
  const rootLayoutPath = path6.join(cwd, project.appRouterPath, "layout.tsx");
  if (fs6.existsSync(rootLayoutPath)) {
    let layoutContent = fs6.readFileSync(rootLayoutPath, "utf-8");
    let layoutModified = false;
    if (layoutContent.includes("suppressHydrationWarning")) {
      log("skip", "Root layout already has suppressHydrationWarning");
    } else {
      const htmlTagRegex = /<html([^>]*)>/;
      const match = layoutContent.match(htmlTagRegex);
      if (match) {
        const existingAttrs = match[1];
        const newHtmlTag = `<html${existingAttrs} suppressHydrationWarning>`;
        layoutContent = layoutContent.replace(htmlTagRegex, newHtmlTag);
        layoutModified = true;
        log("write", `Updated ${project.appRouterPath}/layout.tsx (added suppressHydrationWarning)`);
      } else {
        log("warn", "Could not find <html> tag in root layout. Please add suppressHydrationWarning manually.");
      }
    }
    if (layoutContent.includes("GlobalShortcuts")) {
      log("skip", "Root layout already has GlobalShortcuts");
    } else {
      const importStatement = "import { GlobalShortcuts } from 'autoblogger/ui'\n";
      const lastImportMatch = layoutContent.match(/^import .+$/gm);
      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        layoutContent = layoutContent.replace(lastImport, lastImport + "\n" + importStatement.trim());
      } else {
        layoutContent = importStatement + layoutContent;
      }
      const bodyTagRegex = /<body([^>]*)>/;
      const bodyMatch = layoutContent.match(bodyTagRegex);
      if (bodyMatch) {
        layoutContent = layoutContent.replace(bodyTagRegex, `<body$1>
        <GlobalShortcuts />`);
        layoutModified = true;
        log("write", `Updated ${project.appRouterPath}/layout.tsx (added GlobalShortcuts for Cmd+/ navigation)`);
      } else {
        log("warn", "Could not find <body> tag in root layout. Please add GlobalShortcuts manually.");
        console.log(import_picocolors3.default.gray("  import { GlobalShortcuts } from 'autoblogger/ui'"));
        console.log(import_picocolors3.default.gray("  // Add <GlobalShortcuts /> inside your layout body"));
      }
    }
    if (layoutModified) {
      fs6.writeFileSync(rootLayoutPath, layoutContent);
    }
  }
  if (answers.runMigration) {
    console.log("");
    log("run", "prisma migrate dev --name add-autoblogger");
    try {
      (0, import_child_process2.execSync)("npx prisma migrate dev --name add-autoblogger", {
        cwd,
        stdio: "inherit"
      });
      log("run", "prisma generate");
      (0, import_child_process2.execSync)("npx prisma generate", {
        cwd,
        stdio: "inherit"
      });
    } catch (error) {
      log("error", "Migration failed. You may need to run it manually:");
      console.log(import_picocolors3.default.gray("  npx prisma migrate dev --name add-autoblogger"));
      console.log(import_picocolors3.default.gray("  npx prisma generate"));
    }
  }
  if (answers.importContent && answers.importPath) {
    console.log("");
    const count = contentCounts[answers.importPath] || countMarkdownFiles(path6.join(cwd, answers.importPath));
    log("info", `Found ${count} markdown files in ${answers.importPath}`);
    try {
      await importContent(path6.join(cwd, answers.importPath), { status: "draft" });
    } catch (error) {
      log("warn", `Content import failed: ${error instanceof Error ? error.message : error}`);
      console.log(import_picocolors3.default.gray("  You can import later with: npx autoblogger import <path>"));
    }
  }
  console.log("");
  console.log(import_picocolors3.default.green(import_picocolors3.default.bold("Done!")) + " Visit " + import_picocolors3.default.cyan("localhost:3000/writer") + " to access your CMS dashboard.");
  console.log("");
  console.log(import_picocolors3.default.gray("Next steps:"));
  console.log(import_picocolors3.default.gray("  1. Update lib/cms.ts with your auth configuration"));
  console.log(import_picocolors3.default.gray("  2. Add your auth check to app/(writer)/writer/[[...path]]/page.tsx"));
  console.log(import_picocolors3.default.gray("  3. Set ANTHROPIC_API_KEY and/or OPENAI_API_KEY for AI features"));
  if (answers.deploymentPlatform === "vercel") {
    console.log(import_picocolors3.default.gray("  4. Set CRON_SECRET env var in Vercel for auto-draft security"));
  } else if (answers.deploymentPlatform === "server") {
    console.log(import_picocolors3.default.gray("  4. Schedule scripts/auto-draft.ts via crontab:"));
    console.log(import_picocolors3.default.gray("     0 6 * * * cd /path/to/project && npx tsx scripts/auto-draft.ts"));
  }
  console.log("");
}

// src/cli/index.ts
var import_picocolors4 = __toESM(require("picocolors"));
var VERSION = "0.1.0";
var HELP = `
${import_picocolors4.default.bold("autoblogger")} - CLI for setting up Autoblogger CMS

${import_picocolors4.default.bold("Usage:")}
  npx autoblogger <command> [options]

${import_picocolors4.default.bold("Commands:")}
  init              Set up Autoblogger in your Next.js project
  import <path>     Import markdown/MDX content into the database

${import_picocolors4.default.bold("Init Options:")}
  --yes             Skip prompts and use defaults
  --skip-migrate    Don't run database migration
  --import=<path>   Import content from specified path after setup
  --dry-run         Show what would be done without making changes

${import_picocolors4.default.bold("Import Options:")}
  --status=<status> Set imported posts status (draft, published) [default: draft]
  --tag=<tag>       Add a tag to all imported posts
  --dry-run         Show what would be imported without making changes

${import_picocolors4.default.bold("Examples:")}
  npx autoblogger init
  npx autoblogger init --yes
  npx autoblogger init --import=./content/posts
  npx autoblogger import ./posts --status=draft
`;
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const flags = {
    yes: args.includes("--yes") || args.includes("-y"),
    skipMigrate: args.includes("--skip-migrate"),
    dryRun: args.includes("--dry-run"),
    help: args.includes("--help") || args.includes("-h"),
    version: args.includes("--version") || args.includes("-v"),
    import: args.find((a) => a.startsWith("--import="))?.split("=")[1],
    status: args.find((a) => a.startsWith("--status="))?.split("=")[1],
    tag: args.find((a) => a.startsWith("--tag="))?.split("=")[1]
  };
  if (flags.version) {
    console.log(`autoblogger v${VERSION}`);
    process.exit(0);
  }
  if (flags.help || !command) {
    console.log(HELP);
    process.exit(0);
  }
  try {
    if (command === "init") {
      await init({
        yes: flags.yes,
        skipMigrate: flags.skipMigrate,
        importPath: flags.import,
        dryRun: flags.dryRun
      });
    } else if (command === "import") {
      const path7 = args[1];
      if (!path7) {
        console.error(import_picocolors4.default.red("Error: Please specify a path to import from"));
        console.log("\nUsage: npx autoblogger import <path>");
        process.exit(1);
      }
      await importContent(path7, {
        status: flags.status || "draft",
        tag: flags.tag,
        dryRun: flags.dryRun
      });
    } else {
      console.error(import_picocolors4.default.red(`Unknown command: ${command}`));
      console.log(HELP);
      process.exit(1);
    }
  } catch (error) {
    console.error(import_picocolors4.default.red("Error:"), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
main();
