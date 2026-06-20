// Build-time sitemap generator.
// ----------------------------------------------------------------------------
// Writes app/public/sitemap.xml so it ships in the static build. Static routes
// are always included; dynamic routes (blog articles, portfolio projects,
// promotions, team members) are pulled from Supabase via the public REST API
// using the same VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY the app uses.
//
// This script must NEVER fail the build: any error falls back to the static
// routes and exits 0.
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const SITE_URL = 'https://novagraphikvisu.com'
const OUT = resolve(root, 'app/public/sitemap.xml')

// Static public routes (path → change frequency hint).
const STATIC = ['/', '/portfolios', '/blogs', '/promotions', '/contact', '/partenaires', '/grille-tarifaire', '/site-web-vtc']

// Dynamic routes: Supabase table → URL prefix. RLS already restricts anon reads
// to visible rows, and we also filter visible=eq.1 for safety.
const DYNAMIC = [
  { table: 'articles', prefix: '/blogs' },
  { table: 'portfolio_items', prefix: '/portfolio' },
  { table: 'promotions', prefix: '/promotions' },
  { table: 'team_members', prefix: '/equipe' },
]

/** Read VITE_SUPABASE_* from process.env, falling back to a .env file. */
function loadEnv() {
  let url = process.env.VITE_SUPABASE_URL
  let key = process.env.VITE_SUPABASE_ANON_KEY
  if (url && key) return { url, key }
  for (const p of ['.env', 'app/.env']) {
    const file = resolve(root, p)
    if (!existsSync(file)) continue
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*(VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY)\s*=\s*(.*)\s*$/)
      if (!m) continue
      const val = m[2].replace(/^["']|["']$/g, '').trim()
      if (m[1] === 'VITE_SUPABASE_URL') url ||= val
      else key ||= val
    }
  }
  return { url, key }
}

async function fetchSlugs(url, key, table) {
  const endpoint = `${url}/rest/v1/${table}?select=slug,visible&visible=eq.1`
  const res = await fetch(endpoint, { headers: { apikey: key, Authorization: `Bearer ${key}` } })
  if (!res.ok) throw new Error(`${table}: HTTP ${res.status}`)
  const rows = await res.json()
  return rows.map((r) => r.slug).filter(Boolean)
}

function urlEntry(loc, lastmod, priority) {
  return (
    `  <url>\n` +
    `    <loc>${SITE_URL}${loc}</loc>\n` +
    `    <lastmod>${lastmod}</lastmod>\n` +
    `    <priority>${priority}</priority>\n` +
    `  </url>`
  )
}

async function main() {
  const today = new Date().toISOString().slice(0, 10)
  const locs = new Set(STATIC)

  const { url, key } = loadEnv()
  if (url && key) {
    for (const { table, prefix } of DYNAMIC) {
      try {
        const slugs = await fetchSlugs(url, key, table)
        for (const slug of slugs) locs.add(`${prefix}/${slug}`)
        console.log(`[sitemap] ${table}: ${slugs.length} URLs`)
      } catch (err) {
        console.warn(`[sitemap] skip ${table}: ${err.message}`)
      }
    }
  } else {
    console.warn('[sitemap] VITE_SUPABASE_* missing — static routes only')
  }

  const entries = [...locs].map((loc) => urlEntry(loc, today, loc === '/' ? '1.0' : '0.7'))
  const out =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.join('\n') +
    `\n</urlset>\n`

  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, out, 'utf8')
  console.log(`[sitemap] wrote ${locs.size} URLs → ${OUT}`)
}

main().catch((err) => {
  console.warn(`[sitemap] generation failed, keeping any existing file: ${err.message}`)
  process.exit(0)
})
