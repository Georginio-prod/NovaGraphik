import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync, mkdirSync } from 'node:fs'
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

/* -------------------------------- Uploads -------------------------------- */
const uploadsDir = join(__dirname, 'uploads')
mkdirSync(uploadsDir, { recursive: true })
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (_req, file, cb) => {
    const ext = (file.originalname.match(/\.[a-zA-Z0-9]+$/) || [''])[0].toLowerCase()
    cb(null, randomUUID() + ext)
  },
})
const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } })
app.post('/api/admin/upload', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' })
  res.json({ url: `/uploads/${req.file.filename}` })
})
app.use('/uploads', express.static(uploadsDir))

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

/* ------------------- Serve the built SPA in production -------------------- */
const distDir = join(__dirname, '..', 'dist')
if (existsSync(distDir)) {
  app.use(express.static(distDir))
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next()
    res.sendFile(join(distDir, 'index.html'))
  })
}

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`[nova-api] en écoute sur http://localhost:${PORT}`))
