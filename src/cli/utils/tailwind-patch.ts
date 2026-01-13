import * as fs from 'fs'

const AUTOBLOGGER_CONTENT_PATH = "'./node_modules/autoblogger/dist/**/*.{js,mjs}'"
const AUTOBLOGGER_SOURCE_PATH = '"./node_modules/autoblogger/dist/**/*.{js,mjs}"'

export interface PatchResult {
  success: boolean
  alreadyPatched: boolean
  content?: string
  isCssConfig?: boolean
}

export function patchTailwindConfig(configPath: string): PatchResult {
  if (!fs.existsSync(configPath)) {
    return { success: false, alreadyPatched: false }
  }

  let content = fs.readFileSync(configPath, 'utf-8')

  // Check if already patched
  if (content.includes('autoblogger')) {
    return { success: true, alreadyPatched: true }
  }

  // Try to find the content array and add our path
  // Handle different config formats
  
  // Format 1: content: ['...', '...']
  const contentArrayRegex = /(content\s*:\s*\[)([^\]]*?)(\])/s
  const match = content.match(contentArrayRegex)
  
  if (match) {
    const [full, start, items, end] = match
    const trimmedItems = items.trimEnd()
    const needsComma = trimmedItems.length > 0 && !trimmedItems.endsWith(',')
    
    const newItems = trimmedItems + 
      (needsComma ? ',' : '') + 
      '\n    // Autoblogger components\n    ' + 
      AUTOBLOGGER_CONTENT_PATH + ',\n  '
    
    content = content.replace(full, start + newItems + end)
    
    return { success: true, alreadyPatched: false, content }
  }

  // Format 2: ES module with export default
  // If we can't find a content array, try to add it
  if (content.includes('export default')) {
    // Look for the config object
    const configObjRegex = /(export\s+default\s*\{)/
    if (configObjRegex.test(content)) {
      content = content.replace(
        configObjRegex,
        `$1\n  content: [\n    // Autoblogger components\n    ${AUTOBLOGGER_CONTENT_PATH},\n  ],`
      )
      return { success: true, alreadyPatched: false, content }
    }
  }

  // Format 3: module.exports
  if (content.includes('module.exports')) {
    const moduleExportsRegex = /(module\.exports\s*=\s*\{)/
    if (moduleExportsRegex.test(content)) {
      content = content.replace(
        moduleExportsRegex,
        `$1\n  content: [\n    // Autoblogger components\n    ${AUTOBLOGGER_CONTENT_PATH},\n  ],`
      )
      return { success: true, alreadyPatched: false, content }
    }
  }

  // Could not patch
  return { success: false, alreadyPatched: false }
}

/**
 * Patch Tailwind v4 CSS-based config (e.g., app.css or globals.css with @import "tailwindcss")
 */
export function patchTailwindCssConfig(cssPath: string): PatchResult {
  if (!fs.existsSync(cssPath)) {
    return { success: false, alreadyPatched: false, isCssConfig: true }
  }

  let content = fs.readFileSync(cssPath, 'utf-8')

  // Check if this is a Tailwind v4 CSS config
  if (!content.includes('@import "tailwindcss"') && !content.includes("@import 'tailwindcss'")) {
    return { success: false, alreadyPatched: false, isCssConfig: false }
  }

  // Check if already patched
  if (content.includes('autoblogger')) {
    return { success: true, alreadyPatched: true, isCssConfig: true }
  }

  // Find the @import "tailwindcss" line and add @source after it
  const importRegex = /(@import\s+["']tailwindcss["'];?\s*\n)/
  const match = content.match(importRegex)
  
  if (match) {
    content = content.replace(
      importRegex,
      `$1/* Autoblogger components */\n@source ${AUTOBLOGGER_SOURCE_PATH};\n`
    )
    return { success: true, alreadyPatched: false, content, isCssConfig: true }
  }

  return { success: false, alreadyPatched: false, isCssConfig: true }
}

export function writeTailwindConfig(configPath: string, content: string): void {
  fs.writeFileSync(configPath, content, 'utf-8')
}
