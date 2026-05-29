import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { existsSync } from 'node:fs'
import { db, seed } from './db.js'
import { signToken, requireAdmin } from './auth.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

seed()

const app = express()
app.use(cors())
app.use(express.json())

const sectionCols = 'id, page, type, title, body, visible, position'

/* ---------------------------------- Auth --------------------------------- */
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' })
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase())
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Identifiants incorrects' })
  }
  res.json({ token: signToken(user), user: { id: user.id, email: user.email, role: user.role } })
})

app.get('/api/auth/me', requireAdmin, (req, res) => {
  const user = db.prepare('SELECT id, email, role FROM users WHERE id = ?').get(req.user.sub)
  if (!user) return res.status(404).json({ error: 'Compte introuvable' })
  res.json({ user })
})

/* ----------------------------- Public content ---------------------------- */
app.get('/api/sections', (req, res) => {
  const page = String(req.query.page || 'home')
  const rows = db
    .prepare(`SELECT ${sectionCols} FROM sections WHERE page = ? AND visible = 1 ORDER BY position ASC, id ASC`)
    .all(page)
  res.json({ sections: rows })
})

/* ------------------------------ Admin content ----------------------------- */
app.get('/api/admin/sections', requireAdmin, (req, res) => {
  const page = String(req.query.page || 'home')
  const rows = db
    .prepare(`SELECT ${sectionCols} FROM sections WHERE page = ? ORDER BY position ASC, id ASC`)
    .all(page)
  res.json({ sections: rows })
})

app.post('/api/admin/sections', requireAdmin, (req, res) => {
  const { page = 'home', type = 'Texte', title = '', body = '' } = req.body || {}
  const { m } = db.prepare('SELECT COALESCE(MAX(position), -1) AS m FROM sections WHERE page = ?').get(page)
  const info = db
    .prepare('INSERT INTO sections (page, type, title, body, visible, position) VALUES (?, ?, ?, ?, 1, ?)')
    .run(page, type, title, body, m + 1)
  const section = db.prepare(`SELECT ${sectionCols} FROM sections WHERE id = ?`).get(info.lastInsertRowid)
  res.status(201).json({ section })
})

// Reorder MUST be declared before the parameterised PUT to avoid `:id` capturing it.
app.put('/api/admin/sections/reorder', requireAdmin, (req, res) => {
  const { ids } = req.body || {}
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'Liste d’identifiants requise' })
  const upd = db.prepare("UPDATE sections SET position = ?, updated_at = datetime('now') WHERE id = ?")
  ids.forEach((id, i) => upd.run(i, Number(id)))
  res.json({ ok: true })
})

app.put('/api/admin/sections/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id)
  const existing = db.prepare('SELECT * FROM sections WHERE id = ?').get(id)
  if (!existing) return res.status(404).json({ error: 'Section introuvable' })
  const title = req.body.title ?? existing.title
  const body = req.body.body ?? existing.body
  const type = req.body.type ?? existing.type
  const visible = req.body.visible == null ? existing.visible : req.body.visible ? 1 : 0
  db.prepare("UPDATE sections SET title = ?, body = ?, type = ?, visible = ?, updated_at = datetime('now') WHERE id = ?")
    .run(title, body, type, visible, id)
  const section = db.prepare(`SELECT ${sectionCols} FROM sections WHERE id = ?`).get(id)
  res.json({ section })
})

app.delete('/api/admin/sections/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM sections WHERE id = ?').run(Number(req.params.id))
  res.json({ ok: true })
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
