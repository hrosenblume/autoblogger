import * as fs from 'fs'
import * as path from 'path'

const AUTOBLOGGER_CSS_IMPORT = "@import 'autoblogger/styles/standalone.css';"

export interface CssPatchResult {
  success: boolean
  alreadyPatched: boolean
  filePath?: string
}

/**
 * Find the global CSS file in a Next.js project
 */
export function findGlobalsCss(projectRoot: string): string | null {
  const candidates = [
    'app/globals.css',
    'src/app/globals.css',
    'styles/globals.css',
    'src/styles/globals.css',
    'app/global.css',
    'src/app/global.css',
  ]

  for (const candidate of candidates) {
    const fullPath = path.join(projectRoot, candidate)
    if (fs.existsSync(fullPath)) {
      return fullPath
    }
  }

  return null
}

/**
 * Patch globals.css to import autoblogger styles
 */
export function patchGlobalsCss(cssPath: string): CssPatchResult {
  if (!fs.existsSync(cssPath)) {
    return { success: false, alreadyPatched: false }
  }

  let content = fs.readFileSync(cssPath, 'utf-8')

  // Check if already patched
  if (content.includes('autoblogger')) {
    return { success: true, alreadyPatched: true, filePath: cssPath }
  }

  // Add import at the very top of the file
  content = AUTOBLOGGER_CSS_IMPORT + '\n\n' + content

  fs.writeFileSync(cssPath, content, 'utf-8')
  return { success: true, alreadyPatched: false, filePath: cssPath }
}
