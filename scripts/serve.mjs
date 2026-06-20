// Production static server for the prerendered SPA.
// ----------------------------------------------------------------------------
// `vite preview` does pure SPA fallback (serves the base index.html for every
// route), which would hide the per-route HTML written by scripts/prerender.mjs.
// This server instead resolves clean URLs to their prerendered file:
//   1. exact asset on disk (JS/CSS/img…)        → serve it
//   2. <route>/index.html (prerendered page)     → serve it
//   3. otherwise                                  → base index.html (SPA fallback
//      so client-side routes that weren't prerendered still work)
import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { dirname, resolve, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(__dirname, '..', 'app/dist')
const PORT = Number(process.env.PORT) || 4173
const HOST = '0.0.0.0'

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.txt': 'text/plain', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json',
  '.map': 'application/json',
}

const indexHtml = readFileSync(join(DIST, 'index.html'))

function send(res, status, body, type, immutable = false) {
  res.statusCode = status
  res.setHeader('Content-Type', type)
  if (immutable) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  res.end(body)
}

// Resolve a request path to a file inside DIST, guarding against traversal.
function safeJoin(pathname) {
  const rel = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '')
  const abs = join(DIST, rel)
  return abs.startsWith(DIST) ? abs : null
}

const server = createServer((req, res) => {
  try {
    const { pathname } = new URL(req.url, `http://localhost:${PORT}`)
    const base = safeJoin(pathname)

    // 1. Exact static asset (has an extension and exists on disk).
    if (base && extname(base) && existsSync(base) && statSync(base).isFile()) {
      const type = MIME[extname(base)] || 'application/octet-stream'
      // Vite emits hashed filenames under /assets — safe to cache forever.
      send(res, 200, readFileSync(base), type, pathname.startsWith('/assets/'))
      return
    }

    // 2. Prerendered route page: <route>/index.html.
    if (base) {
      const page = join(base, 'index.html')
      if (existsSync(page) && statSync(page).isFile()) {
        send(res, 200, readFileSync(page), 'text/html; charset=utf-8')
        return
      }
    }
  } catch { /* fall through to SPA index */ }

  // 3. SPA fallback.
  send(res, 200, indexHtml, 'text/html; charset=utf-8')
})

server.listen(PORT, HOST, () => {
  console.log(`[serve] prerendered site on http://${HOST}:${PORT} (dist: ${DIST})`)
})
