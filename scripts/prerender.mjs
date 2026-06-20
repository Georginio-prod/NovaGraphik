// Post-build prerenderer.
// ----------------------------------------------------------------------------
// The app is a client-rendered Vue SPA: search engines that don't execute JS
// (Bing, DuckDuckGo, some social crawlers) receive an empty shell. This script
// loads each route in a real headless browser AFTER `vite build`, lets the app
// render (content + unhead meta tags), and writes the resulting HTML back into
// dist/<route>/index.html so crawlers get fully-formed pages.
//
// It must NEVER fail the build: if Chromium/puppeteer is unavailable or a route
// errors, it logs a warning and exits 0 — the plain SPA still ships.
//
// Railway/nixpacks: install Chromium via nix and set PUPPETEER_EXECUTABLE_PATH
// + PUPPETEER_SKIP_DOWNLOAD=true (see nixpacks.toml).
import { createServer } from 'node:http'
import { readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs'
import { dirname, resolve, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const DIST = resolve(root, 'app/dist')
const SITE_URL = 'https://novagraphikvisu.com'
const PORT = 5179

const STATIC_ROUTES = ['/', '/portfolios', '/blogs', '/promotions', '/contact', '/partenaires', '/grille-tarifaire', '/site-web-vtc']

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml',
}

// Static server with SPA fallback: real assets are served from disk; any HTML
// route falls back to the base index.html so the SPA router renders it.
function startServer() {
  const indexHtml = readFileSync(join(DIST, 'index.html'), 'utf8')
  const server = createServer((req, res) => {
    try {
      const url = new URL(req.url, `http://localhost:${PORT}`)
      const file = join(DIST, decodeURIComponent(url.pathname))
      if (extname(file) && existsSync(file) && statSync(file).isFile()) {
        res.setHeader('Content-Type', MIME[extname(file)] || 'application/octet-stream')
        res.end(readFileSync(file))
        return
      }
    } catch { /* fall through to SPA index */ }
    res.setHeader('Content-Type', 'text/html')
    res.end(indexHtml)
  })
  return new Promise((ok) => server.listen(PORT, () => ok(server)))
}

// Routes = static marketing pages + dynamic slugs read from the built sitemap.
function collectRoutes() {
  const routes = new Set(STATIC_ROUTES)
  const sitemap = join(DIST, 'sitemap.xml')
  if (existsSync(sitemap)) {
    const xml = readFileSync(sitemap, 'utf8')
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const path = m[1].replace(SITE_URL, '') || '/'
      routes.add(path)
    }
  }
  return [...routes]
}

// Locate a Chromium executable. On Railway/nixpacks we install `chromium` via
// nix and skip puppeteer's own download, so resolve it from PATH; locally,
// returning undefined lets puppeteer use its bundled browser.
function findChromium() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH
  const candidates = ['chromium', 'chromium-browser', 'google-chrome-stable', 'google-chrome']
  for (const bin of candidates) {
    try {
      const found = execSync(`command -v ${bin}`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
      if (found) return found
    } catch { /* not on PATH */ }
  }
  return undefined
}

function outFile(route) {
  const clean = route === '/' ? '/index.html' : `${route.replace(/\/$/, '')}/index.html`
  return join(DIST, clean)
}

async function main() {
  if (!existsSync(join(DIST, 'index.html'))) {
    console.warn('[prerender] dist/index.html missing — run after `vite build`. Skipping.')
    return
  }

  let puppeteer
  try {
    puppeteer = (await import('puppeteer')).default
  } catch {
    console.warn('[prerender] puppeteer not installed — skipping prerender (SPA still ships).')
    return
  }

  const server = await startServer()
  const routes = collectRoutes()
  console.log(`[prerender] ${routes.length} routes`)

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: findChromium(),
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  })

  let ok = 0
  for (const route of routes) {
    const page = await browser.newPage()
    try {
      await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: 'networkidle0', timeout: 30000 })
      // Wait until the app has mounted real content into #app.
      await page.waitForFunction(
        () => {
          const app = document.getElementById('app')
          return app && app.children.length > 0 && app.innerText.trim().length > 0
        },
        { timeout: 15000 },
      ).catch(() => {})
      // Drop the boot splash so crawlers don't capture the spinner.
      await page.evaluate(() => document.getElementById('boot-loader')?.remove())
      const html = await page.content()
      const dest = outFile(route)
      mkdirSync(dirname(dest), { recursive: true })
      writeFileSync(dest, html, 'utf8')
      ok++
      console.log(`[prerender] ✓ ${route}`)
    } catch (err) {
      console.warn(`[prerender] ✗ ${route}: ${err.message}`)
    } finally {
      await page.close()
    }
  }

  await browser.close()
  server.close()
  console.log(`[prerender] done: ${ok}/${routes.length} pages`)
}

main().catch((err) => {
  console.warn(`[prerender] failed (build continues): ${err.message}`)
  process.exit(0)
})
