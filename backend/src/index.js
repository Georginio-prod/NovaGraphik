import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { db, seed, slugify, uniqueSlug } from './db.js'
import { requireAdmin } from './auth.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

seed()

const app = express()
app.use(cors())
app.use(express.json())

/* ------------------------------- helpers --------------------------------- */
const SECTION_COLS = 'id, page, type, template, title, body, icon, image, data, visible, position'
const TEAM_COLS = 'id, name, role, bio, photo, slug, parent_id, position, visible'
const PF_COLS = 'id, title, slug, category, description, cover_image, images, external_url, position, visible'

function parseSection(row) {
  if (!row) return row
  try { row.data = JSON.parse(row.data || '{}') } catch { row.data = {} }
  return row
}
function parsePf(row) {
  if (!row) return row
  try { row.images = JSON.parse(row.images || '[]') } catch { row.images = [] }
  return row
}

/* -------------------------------- Auth ----------------------------------
   Sign-in is handled by Supabase on the frontend. The backend only verifies
   the Supabase access token on /api/admin/* via requireAdmin (server/auth.js).
   ------------------------------------------------------------------------ */

/* -------------------------------- Uploads --------------------------------
   Lives at backend/uploads/ by default. In prod (Railway), point UPLOADS_DIR
   at a mounted volume (e.g. /data/uploads) so files survive deploys. */
const uploadsDir = process.env.UPLOADS_DIR || join(__dirname, '..', 'uploads')
mkdirSync(uploadsDir, { recursive: true })
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const ext = (file.originalname.match(/\.[a-zA-Z0-9]+$/) || [''])[0].toLowerCase()
    cb(null, randomUUID() + ext)
  },
})
// Admin media uploads (high-res photos & videos). Files stream to disk, so size
// is cheap on memory. No size cap by default so large videos go through; set
// MAX_UPLOAD_MB to enforce one (e.g. on a constrained platform).
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 0) // 0 = unlimited
const upload = multer({
  storage,
  limits: MAX_UPLOAD_MB > 0 ? { fileSize: MAX_UPLOAD_MB * 1024 * 1024 } : undefined,
})
app.post('/api/admin/upload', requireAdmin, (req, res) => {
  // Wrap multer so its errors (e.g. file too large) return clean JSON instead
  // of an HTML 500 — the client surfaces this message to the user.
  upload.single('file')(req, res, (err) => {
    if (err) {
      // Best-effort: drop any partial file multer wrote before aborting.
      if (req.file?.path) rmSync(req.file.path, { force: true })
      const msg =
        err.code === 'LIMIT_FILE_SIZE'
          ? `Fichier trop lourd (${MAX_UPLOAD_MB} Mo maximum).`
          : 'Échec du téléversement.'
      return res.status(400).json({ error: msg })
    }
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' })
    res.json({ url: `/uploads/${req.file.filename}` })
  })
})
// Serve media with broad-compatibility headers. express.static already honours
// HTTP range requests (needed for video streaming/seek, esp. Safari). We relabel
// .mov/.m4v as video/mp4 so browsers attempt to play H.264-in-MOV inline instead
// of downloading it. (Truly incompatible codecs like HEVC still need transcoding.)
app.use(
  '/uploads',
  express.static(uploadsDir, {
    acceptRanges: true,
    setHeaders: (res, filePath) => {
      if (/\.(mov|m4v)$/i.test(filePath)) res.setHeader('Content-Type', 'video/mp4')
    },
  }),
)

/* ------------------------------- Sections -------------------------------- */
app.get('/api/sections', (req, res) => {
  const page = String(req.query.page || 'home')
  const rows = db
    .prepare(`SELECT ${SECTION_COLS} FROM sections WHERE page = ? AND visible = 1 ORDER BY position ASC, id ASC`)
    .all(page)
  res.json({ sections: rows.map(parseSection) })
})

app.get('/api/admin/sections', requireAdmin, (req, res) => {
  const page = String(req.query.page || 'home')
  const rows = db
    .prepare(`SELECT ${SECTION_COLS} FROM sections WHERE page = ? ORDER BY position ASC, id ASC`)
    .all(page)
  res.json({ sections: rows.map(parseSection) })
})

app.post('/api/admin/sections', requireAdmin, (req, res) => {
  const b = req.body || {}
  const page = b.page || 'home'
  const { m } = db.prepare('SELECT COALESCE(MAX(position), -1) AS m FROM sections WHERE page = ?').get(page)
  const info = db
    .prepare(
      'INSERT INTO sections (page, type, template, title, body, icon, image, data, visible, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)',
    )
    .run(
      page,
      b.type || 'Section',
      b.template || 'text',
      b.title || '',
      b.body || '',
      b.icon || '',
      b.image || '',
      JSON.stringify(b.data || {}),
      m + 1,
    )
  const section = parseSection(db.prepare(`SELECT ${SECTION_COLS} FROM sections WHERE id = ?`).get(info.lastInsertRowid))
  res.status(201).json({ section })
})

app.put('/api/admin/sections/reorder', requireAdmin, (req, res) => {
  const { ids } = req.body || {}
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'Liste d’identifiants requise' })
  const upd = db.prepare("UPDATE sections SET position = ?, updated_at = datetime('now') WHERE id = ?")
  ids.forEach((id, i) => upd.run(i, Number(id)))
  res.json({ ok: true })
})

app.put('/api/admin/sections/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  const ex = db.prepare('SELECT * FROM sections WHERE id = ?').get(id)
  if (!ex) return res.status(404).json({ error: 'Section introuvable' })
  const b = req.body || {}
  db.prepare(
    "UPDATE sections SET type=?, template=?, title=?, body=?, icon=?, image=?, data=?, visible=?, updated_at=datetime('now') WHERE id=?",
  ).run(
    b.type ?? ex.type,
    b.template ?? ex.template,
    b.title ?? ex.title,
    b.body ?? ex.body,
    b.icon ?? ex.icon,
    b.image ?? ex.image,
    b.data !== undefined ? JSON.stringify(b.data) : ex.data,
    b.visible == null ? ex.visible : b.visible ? 1 : 0,
    id,
  )
  const section = parseSection(db.prepare(`SELECT ${SECTION_COLS} FROM sections WHERE id = ?`).get(id))
  res.json({ section })
})

app.delete('/api/admin/sections/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM sections WHERE id = ?').run(Number(req.params.id))
  res.json({ ok: true })
})

/* --------------------------------- Team ---------------------------------- */
app.get('/api/team', (_req, res) => {
  const rows = db.prepare(`SELECT ${TEAM_COLS} FROM team_members WHERE visible = 1 ORDER BY position ASC, id ASC`).all()
  res.json({ members: rows })
})
app.get('/api/team/:slug', (req, res) => {
  const row = db.prepare(`SELECT ${TEAM_COLS} FROM team_members WHERE slug = ? AND visible = 1`).get(req.params.slug)
  if (!row) return res.status(404).json({ error: 'Membre introuvable' })
  res.json({ member: row })
})

app.get('/api/admin/team', requireAdmin, (_req, res) => {
  res.json({ members: db.prepare(`SELECT ${TEAM_COLS} FROM team_members ORDER BY position ASC, id ASC`).all() })
})
app.post('/api/admin/team', requireAdmin, (req, res) => {
  const b = req.body || {}
  const slug = uniqueSlug('team_members', slugify(b.name || 'membre'))
  const { m } = db.prepare('SELECT COALESCE(MAX(position), -1) AS m FROM team_members').get()
  const info = db
    .prepare('INSERT INTO team_members (name, role, bio, photo, slug, parent_id, position, visible) VALUES (?, ?, ?, ?, ?, ?, ?, 1)')
    .run(b.name || '', b.role || '', b.bio || '', b.photo || '', slug, b.parent_id ?? null, m + 1)
  res.status(201).json({ member: db.prepare(`SELECT ${TEAM_COLS} FROM team_members WHERE id = ?`).get(info.lastInsertRowid) })
})
app.put('/api/admin/team/reorder', requireAdmin, (req, res) => {
  const { ids } = req.body || {}
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'Liste d’identifiants requise' })
  const upd = db.prepare('UPDATE team_members SET position = ? WHERE id = ?')
  ids.forEach((id, i) => upd.run(i, Number(id)))
  res.json({ ok: true })
})
app.put('/api/admin/team/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  const ex = db.prepare('SELECT * FROM team_members WHERE id = ?').get(id)
  if (!ex) return res.status(404).json({ error: 'Membre introuvable' })
  const b = req.body || {}
  const name = b.name ?? ex.name
  const slug = name !== ex.name ? uniqueSlug('team_members', slugify(name), id) : ex.slug
  db.prepare('UPDATE team_members SET name=?, role=?, bio=?, photo=?, slug=?, parent_id=?, visible=? WHERE id=?').run(
    name,
    b.role ?? ex.role,
    b.bio ?? ex.bio,
    b.photo ?? ex.photo,
    slug,
    b.parent_id === undefined ? ex.parent_id : b.parent_id,
    b.visible == null ? ex.visible : b.visible ? 1 : 0,
    id,
  )
  res.json({ member: db.prepare(`SELECT ${TEAM_COLS} FROM team_members WHERE id = ?`).get(id) })
})
app.delete('/api/admin/team/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  const ex = db.prepare('SELECT parent_id FROM team_members WHERE id = ?').get(id)
  if (ex) db.prepare('UPDATE team_members SET parent_id = ? WHERE parent_id = ?').run(ex.parent_id ?? null, id)
  db.prepare('DELETE FROM team_members WHERE id = ?').run(id)
  res.json({ ok: true })
})

/* ------------------------------- Portfolio ------------------------------- */
app.get('/api/portfolio', (req, res) => {
  const cat = req.query.category ? String(req.query.category) : null
  const rows = cat
    ? db.prepare(`SELECT ${PF_COLS} FROM portfolio_items WHERE visible = 1 AND category = ? ORDER BY position ASC, id ASC`).all(cat)
    : db.prepare(`SELECT ${PF_COLS} FROM portfolio_items WHERE visible = 1 ORDER BY position ASC, id ASC`).all()
  const categories = db
    .prepare(`SELECT DISTINCT category FROM portfolio_items WHERE visible = 1 AND category != '' ORDER BY category`)
    .all()
    .map((r) => r.category)
  res.json({ items: rows.map(parsePf), categories })
})
app.get('/api/portfolio/:slug', (req, res) => {
  const row = db.prepare(`SELECT ${PF_COLS} FROM portfolio_items WHERE slug = ? AND visible = 1`).get(req.params.slug)
  if (!row) return res.status(404).json({ error: 'Réalisation introuvable' })
  res.json({ item: parsePf(row) })
})

app.get('/api/admin/portfolio', requireAdmin, (_req, res) => {
  const rows = db.prepare(`SELECT ${PF_COLS} FROM portfolio_items ORDER BY position ASC, id ASC`).all()
  res.json({ items: rows.map(parsePf) })
})
app.post('/api/admin/portfolio', requireAdmin, (req, res) => {
  const b = req.body || {}
  const slug = uniqueSlug('portfolio_items', slugify(b.title || 'projet'))
  const { m } = db.prepare('SELECT COALESCE(MAX(position), -1) AS m FROM portfolio_items').get()
  const info = db
    .prepare(
      'INSERT INTO portfolio_items (title, slug, category, description, cover_image, images, external_url, position, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)',
    )
    .run(b.title || '', slug, b.category || '', b.description || '', b.cover_image || '', JSON.stringify(b.images || []), b.external_url || '', m + 1)
  res.status(201).json({ item: parsePf(db.prepare(`SELECT ${PF_COLS} FROM portfolio_items WHERE id = ?`).get(info.lastInsertRowid)) })
})
app.put('/api/admin/portfolio/reorder', requireAdmin, (req, res) => {
  const { ids } = req.body || {}
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'Liste d’identifiants requise' })
  const upd = db.prepare('UPDATE portfolio_items SET position = ? WHERE id = ?')
  ids.forEach((id, i) => upd.run(i, Number(id)))
  res.json({ ok: true })
})
app.put('/api/admin/portfolio/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  const ex = db.prepare('SELECT * FROM portfolio_items WHERE id = ?').get(id)
  if (!ex) return res.status(404).json({ error: 'Réalisation introuvable' })
  const b = req.body || {}
  const title = b.title ?? ex.title
  const slug = title !== ex.title ? uniqueSlug('portfolio_items', slugify(title), id) : ex.slug
  db.prepare(
    'UPDATE portfolio_items SET title=?, slug=?, category=?, description=?, cover_image=?, images=?, external_url=?, visible=? WHERE id=?',
  ).run(
    title,
    slug,
    b.category ?? ex.category,
    b.description ?? ex.description,
    b.cover_image ?? ex.cover_image,
    b.images !== undefined ? JSON.stringify(b.images) : ex.images,
    b.external_url ?? ex.external_url,
    b.visible == null ? ex.visible : b.visible ? 1 : 0,
    id,
  )
  res.json({ item: parsePf(db.prepare(`SELECT ${PF_COLS} FROM portfolio_items WHERE id = ?`).get(id)) })
})
app.delete('/api/admin/portfolio/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM portfolio_items WHERE id = ?').run(Number(req.params.id))
  res.json({ ok: true })
})

/* -------------------------------- Settings ------------------------------- */
app.get('/api/settings', (_req, res) => {
  const rows = db.prepare('SELECT key, value FROM settings').all()
  res.json({ settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) })
})
app.put('/api/admin/settings', requireAdmin, (req, res) => {
  const settings = (req.body && req.body.settings) || {}
  const upsert = db.prepare(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
  )
  for (const [k, v] of Object.entries(settings)) upsert.run(String(k), String(v ?? ''))
  const rows = db.prepare('SELECT key, value FROM settings').all()
  res.json({ settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) })
})

/* ---------------------- Generic CRUD for simple entities ----------------- */
function entityCrud({ name, table, cols, parseRow = null, fields }) {
  const select = (where) => `SELECT ${cols} FROM ${table}${where ? ' WHERE ' + where : ''} ORDER BY position ASC, id ASC`
  const wrap = (rows) => (parseRow ? rows.map(parseRow) : rows)

  app.get(`/api/${name}`, (_req, res) => res.json({ items: wrap(db.prepare(select('visible = 1')).all()) }))
  app.get(`/api/admin/${name}`, requireAdmin, (_req, res) => res.json({ items: wrap(db.prepare(select()).all()) }))

  app.put(`/api/admin/${name}/reorder`, requireAdmin, (req, res) => {
    const { ids } = req.body || {}
    if (!Array.isArray(ids)) return res.status(400).json({ error: 'Liste d’identifiants requise' })
    const upd = db.prepare(`UPDATE ${table} SET position = ? WHERE id = ?`)
    ids.forEach((id, i) => upd.run(i, Number(id)))
    res.json({ ok: true })
  })

  app.post(`/api/admin/${name}`, requireAdmin, (req, res) => {
    const b = req.body || {}
    const { m } = db.prepare(`SELECT COALESCE(MAX(position), -1) AS m FROM ${table}`).get()
    const insertCols = ['position', 'visible', ...fields.map((f) => f.col)]
    const insertVals = [
      m + 1,
      1,
      ...fields.map((f) => {
        const raw = b[f.col] ?? f.default ?? ''
        return f.toDb ? f.toDb(raw) : raw
      }),
    ]
    const ph = insertCols.map(() => '?').join(', ')
    const info = db.prepare(`INSERT INTO ${table} (${insertCols.join(', ')}) VALUES (${ph})`).run(...insertVals)
    const row = db.prepare(`SELECT ${cols} FROM ${table} WHERE id = ?`).get(info.lastInsertRowid)
    res.status(201).json({ item: parseRow ? parseRow(row) : row })
  })

  app.put(`/api/admin/${name}/:id`, requireAdmin, (req, res) => {
    const id = Number(req.params.id)
    const ex = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id)
    if (!ex) return res.status(404).json({ error: 'Introuvable' })
    const b = req.body || {}
    const upCols = [...fields.map((f) => f.col), 'visible']
    const upVals = [
      ...fields.map((f) => {
        const v = b[f.col] !== undefined ? b[f.col] : ex[f.col]
        return f.toDb ? f.toDb(v) : v
      }),
      b.visible == null ? ex.visible : b.visible ? 1 : 0,
    ]
    const setSql = upCols.map((c) => `${c} = ?`).join(', ')
    db.prepare(`UPDATE ${table} SET ${setSql} WHERE id = ?`).run(...upVals, id)
    const row = db.prepare(`SELECT ${cols} FROM ${table} WHERE id = ?`).get(id)
    res.json({ item: parseRow ? parseRow(row) : row })
  })

  app.delete(`/api/admin/${name}/:id`, requireAdmin, (req, res) => {
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(Number(req.params.id))
    res.json({ ok: true })
  })
}

entityCrud({ name: 'nav', table: 'nav_items', cols: 'id, label, path, position, visible', fields: [{ col: 'label' }, { col: 'path' }] })
entityCrud({
  name: 'services',
  table: 'services',
  cols: 'id, icon, title, description, position, visible',
  fields: [{ col: 'icon', default: 'sparkles' }, { col: 'title' }, { col: 'description' }],
})
entityCrud({
  name: 'articles',
  table: 'articles',
  cols: 'id, title, slug, category, excerpt, body, cover_image, date, position, visible',
  fields: [
    { col: 'title' },
    { col: 'slug' },
    { col: 'category' },
    { col: 'excerpt' },
    { col: 'body' },
    { col: 'cover_image' },
    { col: 'date' },
  ],
})
entityCrud({
  name: 'partners',
  table: 'partners',
  cols: 'id, name, logo_url, position, visible',
  fields: [{ col: 'name' }, { col: 'logo_url' }],
})
entityCrud({
  name: 'testimonials',
  table: 'testimonials',
  cols: 'id, quote, author_name, author_role, position, visible',
  fields: [{ col: 'quote' }, { col: 'author_name' }, { col: 'author_role' }],
})
entityCrud({
  name: 'pricing-items',
  table: 'pricing_items',
  cols: 'id, group_title, group_icon, name, description, price, position, visible',
  fields: [
    { col: 'group_title' },
    { col: 'group_icon' },
    { col: 'name' },
    { col: 'description' },
    { col: 'price' },
  ],
})
entityCrud({
  name: 'pricing-formulas',
  table: 'pricing_formulas',
  cols: 'id, name, price, features, is_hot, position, visible',
  parseRow: (r) => {
    try { r.features = JSON.parse(r.features || '[]') } catch { r.features = [] }
    return r
  },
  fields: [
    { col: 'name' },
    { col: 'price' },
    { col: 'features', default: [], toDb: (v) => JSON.stringify(Array.isArray(v) ? v : []) },
    { col: 'is_hot', default: 0, toDb: (v) => (v ? 1 : 0) },
  ],
})

/* ------------------- Serve the built SPA in production --------------------
   When deployed as 2 separate services (recommended on Railway / Render /
   Vercel split), the frontend is served by its own host and this block is
   inert. For a monolithic prod check (`npm run build` in app/ then run this
   server), it serves app/dist/ as a SPA fallback. Override via STATIC_DIR. */
const distDir = process.env.STATIC_DIR || join(__dirname, '..', '..', 'app', 'dist')
if (existsSync(distDir)) {
  app.use(express.static(distDir))
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next()
    res.sendFile(join(distDir, 'index.html'))
  })
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`[nova-api] en écoute sur http://localhost:${PORT}`))
