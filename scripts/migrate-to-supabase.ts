// ============================================================================
// One-shot data migration: legacy Express backend (SQLite + disk uploads)
//                          ->  Supabase (Postgres + Storage)
// ============================================================================
// Run (Node >= 22.12 strips the TS types at runtime):
//   SUPABASE_URL=https://<ref>.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
//   DB_PATH=./backend/data.sqlite UPLOADS_DIR=./backend/uploads \
//   node --experimental-strip-types scripts/migrate-to-supabase.ts
//   # or: npm run migrate:supabase
//
// The SERVICE ROLE key bypasses RLS for the import — never ship it to the client.
// Idempotent-ish: upserts rows by id and upserts storage files.
// ============================================================================
import { DatabaseSync } from 'node:sqlite'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DB_PATH = process.env.DB_PATH || join(root, 'backend', 'data.sqlite')
const UPLOADS_DIR = process.env.UPLOADS_DIR || join(root, 'backend', 'uploads')
const BUCKET = process.env.SUPABASE_BUCKET || 'media'

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('✗ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
  process.exit(1)
}
if (!existsSync(DB_PATH)) {
  console.error(`✗ SQLite file not found at ${DB_PATH} (set DB_PATH).`)
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })
const db = new DatabaseSync(DB_PATH, { readOnly: true })

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.avif': 'image/avif',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/mp4', '.m4v': 'video/mp4', '.ogg': 'video/ogg',
}
const publicBase = `${SUPABASE_URL.replace(/\/+$/, '')}/storage/v1/object/public/${BUCKET}`

// ── 1. Upload every file from the uploads dir to the media bucket ────────────
async function uploadMedia(): Promise<void> {
  if (!existsSync(UPLOADS_DIR)) {
    console.warn(`! uploads dir ${UPLOADS_DIR} missing — skipping media upload.`)
    return
  }
  const files = readdirSync(UPLOADS_DIR).filter((f) => !f.startsWith('.'))
  console.log(`→ uploading ${files.length} media files to bucket "${BUCKET}"…`)
  for (const name of files) {
    const ext = extname(name).toLowerCase()
    const body = readFileSync(join(UPLOADS_DIR, name))
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(name, body, { contentType: MIME[ext] || 'application/octet-stream', upsert: true })
    if (error) console.warn(`  ! ${name}: ${error.message}`)
  }
  console.log('  ✓ media done')
}

// Rewrite a stored media reference: /uploads/<file>[?query] → public Storage URL.
function rewriteUrl(url: unknown): unknown {
  if (typeof url !== 'string') return url
  const m = url.match(/^\/uploads\/([^?#]+)(.*)$/)
  return m ? `${publicBase}/${m[1]}${m[2] || ''}` : url
}
const rewriteList = (arr: unknown) => (Array.isArray(arr) ? arr.map(rewriteUrl) : arr)
const parseJson = <T>(v: unknown, fallback: T): T => {
  try { return JSON.parse(String(v)) as T } catch { return fallback }
}

const rows = (sql: string): any[] => db.prepare(sql).all() as any[]

async function migrateTable(table: string, data: any[], conflict = 'id'): Promise<void> {
  if (!data.length) { console.log(`→ ${table}: 0 rows`); return }
  const { error } = await supabase.from(table).upsert(data, { onConflict: conflict })
  if (error) console.error(`  ✗ ${table}: ${error.message}`)
  else console.log(`→ ${table}: ${data.length} rows ✓`)
}

async function migrateData(): Promise<void> {
  await migrateTable('sections', rows('SELECT * FROM sections').map((r) => ({
    ...r, image: rewriteUrl(r.image), data: parseJson(r.data, {}),
  })))
  await migrateTable('team_members', rows('SELECT * FROM team_members').map((r) => ({
    ...r, photo: rewriteUrl(r.photo),
  })))
  await migrateTable('portfolio_items', rows('SELECT * FROM portfolio_items').map((r) => ({
    ...r, cover_image: rewriteUrl(r.cover_image), images: rewriteList(parseJson(r.images, [])),
  })))
  await migrateTable('settings', rows('SELECT key, value FROM settings').map((r) => ({
    ...r, value: rewriteUrl(r.value),
  })), 'key')
  await migrateTable('nav_items', rows('SELECT * FROM nav_items'))
  await migrateTable('services', rows('SELECT * FROM services'))
  await migrateTable('articles', rows('SELECT * FROM articles').map((r) => ({
    ...r, cover_image: rewriteUrl(r.cover_image),
  })))
  await migrateTable('partners', rows('SELECT * FROM partners').map((r) => ({
    ...r, logo_url: rewriteUrl(r.logo_url),
  })))
  await migrateTable('testimonials', rows('SELECT * FROM testimonials'))
  await migrateTable('pricing_items', rows('SELECT * FROM pricing_items'))
  await migrateTable('pricing_formulas', rows('SELECT * FROM pricing_formulas').map((r) => ({
    ...r, features: parseJson(r.features, []),
  })))
}

console.log(`Nova Graphik → Supabase migration\n  ${DB_PATH}\n  ${UPLOADS_DIR}\n  → ${SUPABASE_URL}\n`)
await uploadMedia()
await migrateData()
console.log('\n✓ Migration finished. Verify in the Supabase dashboard, then deploy the front pointed at Supabase.')
