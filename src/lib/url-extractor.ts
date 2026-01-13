import type { Browser } from 'puppeteer-core'

// Regex to match URLs in text - supports both with and without protocol
// Matches: https://example.com, http://example.com, www.example.com, example.com/path
const URL_WITH_PROTOCOL = /https?:\/\/[^\s<>\[\]()]+(?:\([^\s<>\[\]()]*\))?[^\s<>\[\]().,;:!?"']*(?<![.,;:!?"'])/gi
const URL_WITHOUT_PROTOCOL = /(?:www\.)[a-zA-Z0-9][-a-zA-Z0-9]*(?:\.[a-zA-Z]{2,})+(?:\/[^\s<>\[\]()]*)?/gi
const DOMAIN_ONLY = /(?<![/@])(?:[a-zA-Z0-9][-a-zA-Z0-9]*\.)+(?:com|org|net|edu|gov|io|co|app|dev|news|info)(?:\/[^\s<>\[\]()]*)?(?![a-zA-Z])/gi

// Puppeteer configuration
const PUPPETEER_TIMEOUT = 15000 // 15 seconds max for page load
const CONTENT_WAIT_TIME = 2000 // Wait 2s after load for JS to render

/**
 * Detect if we're running in a serverless environment (Vercel, AWS Lambda, etc.)
 * In serverless, we use @sparticuz/chromium. Locally, we use regular puppeteer.
 */
function isServerlessEnvironment(): boolean {
  return !!(
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.VERCEL ||
    process.env.NETLIFY ||
    process.env.AWS_EXECUTION_ENV
  )
}

/**
 * Extract URLs from text.
 * Supports URLs with protocol (https://), www prefix, or bare domains.
 */
export function extractUrls(text: string): string[] {
  const urls: string[] = []
  
  // Match URLs with protocol first (highest priority)
  const withProtocol = text.match(URL_WITH_PROTOCOL)
  if (withProtocol) urls.push(...withProtocol)
  
  // Match www. URLs
  const wwwUrls = text.match(URL_WITHOUT_PROTOCOL)
  if (wwwUrls) {
    for (const url of wwwUrls) {
      // Add https:// prefix for consistency
      const normalized = `https://${url}`
      if (!urls.some(u => u.includes(url))) {
        urls.push(normalized)
      }
    }
  }
  
  // Match bare domain URLs (newsday.com, example.org, etc.)
  const bareUrls = text.match(DOMAIN_ONLY)
  if (bareUrls) {
    for (const url of bareUrls) {
      // Add https:// prefix for consistency
      const normalized = `https://${url}`
      if (!urls.some(u => u.includes(url.split('/')[0]))) {
        urls.push(normalized)
      }
    }
  }
  
  return [...new Set(urls)]
}

export interface FetchedContent {
  url: string
  title?: string
  content: string
  error?: string
}

/**
 * Simple HTML text extraction without JSDOM.
 * Used as fallback when JSDOM fails (common with npm link).
 */
function extractTextFromHtml(html: string, url: string): FetchedContent {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : undefined

  // Remove scripts, styles, and other non-content elements
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    // Replace tags with appropriate spacing
    .replace(/<(p|div|br|h[1-6]|li|tr)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, ' ')
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .replace(/\n+/g, '\n')
    .trim()

  // Limit content
  if (text.length > 4000) {
    text = text.slice(0, 4000) + '\n\n[Content truncated...]'
  }

  if (text.length < 50) {
    return { url, content: '', error: 'Could not extract meaningful content' }
  }

  return { url, title, content: text }
}

/**
 * Parse HTML with Mozilla Readability.
 * Falls back to simple regex extraction if JSDOM fails.
 */
async function parseWithReadability(html: string, url: string): Promise<FetchedContent> {
  try {
    const { JSDOM } = await import('jsdom')
    const { Readability } = await import('@mozilla/readability')

    // CRITICAL: Do NOT load any external resources
    // Explicitly set resources to undefined to prevent Next.js/npm link issues
    const doc = new JSDOM(html, { 
      url,
      resources: undefined,  // Don't load ANY external resources (stylesheets, etc.)
      runScripts: undefined, // Don't run any scripts
    })
    const reader = new Readability(doc.window.document)
    const article = reader.parse()

    if (!article || !article.textContent) {
      // Readability couldn't parse - try simple extraction
      console.log('[Readability] No article content, falling back to simple extraction')
      return extractTextFromHtml(html, url)
    }

    // Limit content to avoid token bloat (~4000 chars ≈ 1000 tokens)
    let content = article.textContent.trim()
    if (content.length > 4000) {
      content = content.slice(0, 4000) + '\n\n[Content truncated...]'
    }

    return {
      url,
      title: article.title || undefined,
      content,
    }
  } catch (error) {
    // JSDOM failed (common with npm link due to native module issues)
    console.error('[JSDOM] Failed, using simple extraction:', error instanceof Error ? error.message : error)
    return extractTextFromHtml(html, url)
  }
}

/**
 * Fetch URL content using Puppeteer (headless browser).
 * This handles JavaScript-rendered pages and some paywalls.
 * 
 * Environment detection:
 * - Local development: Uses regular `puppeteer` (auto-downloads Chrome)
 * - Serverless (Vercel/Lambda): Uses `@sparticuz/chromium` + `puppeteer-core`
 */
async function fetchWithPuppeteer(url: string): Promise<FetchedContent> {
  let browser: Browser | null = null
  const isServerless = isServerlessEnvironment()
  
  try {
    console.log(`[Puppeteer] Launching browser for: ${url} (serverless: ${isServerless})`)
    
    if (isServerless) {
      // Serverless environment: use @sparticuz/chromium
      const chromium = await import('@sparticuz/chromium')
      const puppeteerCore = await import('puppeteer-core')
      
      const executablePath = await chromium.default.executablePath()
      
      browser = await puppeteerCore.default.launch({
        args: chromium.default.args,
        defaultViewport: chromium.default.defaultViewport,
        executablePath,
        headless: chromium.default.headless,
      })
    } else {
      // Local development: use regular puppeteer (has its own Chrome)
      try {
        const puppeteer = await import('puppeteer')
        
        browser = await puppeteer.default.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
          ],
        })
      } catch (puppeteerImportError) {
        // Puppeteer import/launch failed - this can happen with npm link or missing Chrome
        console.error('[Puppeteer] Import/launch failed:', puppeteerImportError)
        return { url, content: '', error: 'Puppeteer unavailable - falling back to simple fetch' }
      }
    }
    
    const page = await browser.newPage()
    
    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 })
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )
    
    // Block unnecessary resources to speed up loading
    await page.setRequestInterception(true)
    page.on('request', (req) => {
      const resourceType = req.resourceType()
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        req.abort()
      } else {
        req.continue()
      }
    })
    
    // Navigate with timeout
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: PUPPETEER_TIMEOUT,
    })
    
    // Wait a bit for any remaining JS to execute
    await new Promise(resolve => setTimeout(resolve, CONTENT_WAIT_TIME))
    
    // Get the rendered HTML
    const html = await page.content()
    
    // Close browser before parsing to free resources
    await browser.close()
    browser = null
    
    console.log('[Puppeteer] Got HTML, parsing with Readability...')
    
    // Parse with Readability
    return await parseWithReadability(html, url)
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Puppeteer error'
    console.error('[Puppeteer] Failed:', errorMessage)
    return { url, content: '', error: `Puppeteer: ${errorMessage}` }
  } finally {
    // Ensure browser is closed even on error
    if (browser) {
      try {
        await browser.close()
      } catch {
        // Ignore close errors
      }
    }
  }
}

/**
 * Fetch URL content using simple HTTP request + Mozilla Readability.
 * This is the fallback method when Puppeteer fails or isn't available.
 */
async function fetchWithSimpleRequest(url: string): Promise<FetchedContent> {
  try {
    console.log('[SimpleFetch] Fetching:', url)
    
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })

    if (!res.ok) {
      return { url, content: '', error: `HTTP ${res.status}` }
    }

    const html = await res.text()
    return parseWithReadability(html, url)
  } catch (error) {
    return {
      url,
      content: '',
      error: error instanceof Error ? error.message : 'Failed to fetch',
    }
  }
}

/**
 * Fetch URL content - tries Puppeteer first for JavaScript-rendered pages,
 * falls back to simple HTTP request if Puppeteer fails.
 */
export async function fetchUrlContent(url: string): Promise<FetchedContent> {
  console.log('[URL Extractor] Fetching content from:', url)
  
  // Try Puppeteer first (better for JS-rendered and paywalled sites)
  const puppeteerResult = await fetchWithPuppeteer(url)
  
  // Check if Puppeteer succeeded with actual content
  if (!puppeteerResult.error && puppeteerResult.content && puppeteerResult.content.length > 100) {
    console.log('[URL Extractor] Puppeteer succeeded, got', puppeteerResult.content.length, 'chars')
    return puppeteerResult
  }
  
  // Puppeteer failed or got minimal content - try simple fetch as fallback
  console.log('[URL Extractor] Puppeteer failed or got minimal content, trying simple fetch...')
  const simpleResult = await fetchWithSimpleRequest(url)
  
  // Return whichever got more content
  if (simpleResult.content && simpleResult.content.length > (puppeteerResult.content?.length || 0)) {
    console.log('[URL Extractor] Simple fetch got more content:', simpleResult.content.length, 'chars')
    return simpleResult
  }
  
  // Return Puppeteer result (even if it failed, it has better error info)
  if (puppeteerResult.content && puppeteerResult.content.length > 0) {
    return puppeteerResult
  }
  
  // Both failed - return the simple fetch error (usually more informative)
  return simpleResult.error ? simpleResult : puppeteerResult
}

/**
 * Extract URLs from text and fetch their content.
 * Returns fetched content for all URLs found.
 */
export async function extractAndFetchUrls(text: string): Promise<FetchedContent[]> {
  const urls = extractUrls(text)
  if (urls.length === 0) return []

  // Limit to 3 URLs to avoid abuse and long waits
  const toFetch = urls.slice(0, 3)

  // Fetch in parallel for speed
  const results = await Promise.all(toFetch.map(url => fetchUrlContent(url)))

  return results
}

/**
 * Build context string from fetched URLs for AI prompts.
 */
export function buildUrlContext(fetched: FetchedContent[]): string {
  const successful = fetched.filter((f) => !f.error && f.content)
  if (successful.length === 0) return ''

  return `
<referenced_urls>
${successful
  .map(
    (f) =>
      `<url src="${f.url}"${f.title ? ` title="${f.title}"` : ''}>
${f.content}
</url>`
  )
  .join('\n\n')}
</referenced_urls>

Use the content from these URLs when relevant to the conversation.`
}
