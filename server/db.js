import { DatabaseSync } from 'node:sqlite'
import bcrypt from 'bcryptjs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = process.env.DB_PATH || join(__dirname, 'data.sqlite')

export const db = new DatabaseSync(DB_PATH)

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'admin',
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS sections (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    page       TEXT NOT NULL,
    type       TEXT NOT NULL,
    template   TEXT NOT NULL DEFAULT 'text',
    title      TEXT NOT NULL DEFAULT '',
    body       TEXT NOT NULL DEFAULT '',
    icon       TEXT NOT NULL DEFAULT '',
    image      TEXT NOT NULL DEFAULT '',
    data       TEXT NOT NULL DEFAULT '{}',
    visible    INTEGER NOT NULL DEFAULT 1,
    position   INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS team_members (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL DEFAULT '',
    role       TEXT NOT NULL DEFAULT '',
    bio        TEXT NOT NULL DEFAULT '',
    photo      TEXT NOT NULL DEFAULT '',
    slug       TEXT NOT NULL DEFAULT '',
    parent_id  INTEGER,
    position   INTEGER NOT NULL DEFAULT 0,
    visible    INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS portfolio_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL DEFAULT '',
    slug        TEXT NOT NULL DEFAULT '',
    category    TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    cover_image TEXT NOT NULL DEFAULT '',
    images      TEXT NOT NULL DEFAULT '[]',
    position    INTEGER NOT NULL DEFAULT 0,
    visible     INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
  );
`)

// --- lightweight migration: add columns to pre-existing `sections` tables ---
function ensureColumn(table, col, ddl) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name)
  if (!cols.includes(col)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${ddl}`)
}
for (const [col, ddl] of [
  ['template', "TEXT NOT NULL DEFAULT 'text'"],
  ['icon', "TEXT NOT NULL DEFAULT ''"],
  ['image', "TEXT NOT NULL DEFAULT ''"],
  ['data', "TEXT NOT NULL DEFAULT '{}'"],
]) {
  ensureColumn('sections', col, ddl)
}

export function slugify(str) {
  return String(str)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60) || 'item'
}

// Ensure a slug is unique within a table.
export function uniqueSlug(table, base, ignoreId = null) {
  let slug = base
  let n = 1
  for (;;) {
    const row = ignoreId
      ? db.prepare(`SELECT id FROM ${table} WHERE slug = ? AND id != ?`).get(slug, ignoreId)
      : db.prepare(`SELECT id FROM ${table} WHERE slug = ?`).get(slug)
    if (!row) return slug
    slug = `${base}-${++n}`
  }
}

// First-run seed: admin account, home sections, settings, team and portfolio.
export function seed() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@novagraphik.fr').toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD || 'NovaAdmin2026!'

  if (!db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail)) {
    const hash = bcrypt.hashSync(adminPassword, 10)
    db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)').run(adminEmail, hash, 'admin')
    console.log(`[seed] admin créé → ${adminEmail} / ${adminPassword}  (changez le mot de passe en production)`)
  }

  if (db.prepare('SELECT COUNT(*) AS c FROM sections WHERE page = ?').get('home').c === 0) {
    const ins = db.prepare(
      'INSERT INTO sections (page, type, template, title, body, visible, position) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    const rows = [
      ['home', 'Hero', 'hero', "L'essence du raffinement visuel.", "Nous accompagnons les entreprises, marques et particuliers dans la création d'une communication visuelle forte, moderne et impactante.", 1, 0],
      ['home', 'Services', 'services', 'Tout ce qui est lié au digital', "De l'identité de marque au motion design, nous couvrons l'ensemble de votre communication visuelle.", 1, 1],
      ['home', 'Portfolios', 'portfolio', 'Notre univers créatif', 'Une sélection de nos réalisations récentes.', 1, 2],
      ['home', 'Équipe', 'team', "L'équipe Nova", 'Une équipe passionnée qui met sa créativité et son sens du détail au service de votre réussite.', 1, 3],
    ]
    for (const r of rows) ins.run(...r)
    console.log('[seed] sections de la page d’accueil initialisées')
  }

  if (db.prepare('SELECT COUNT(*) AS c FROM settings').get().c === 0) {
    const ins = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
    const defaults = {
      site_title: 'Nova Graphik',
      tagline: "L'essence du raffinement",
      contact_email: 'Novagraphiksat@gmail.com',
      contact_phone: '+228 97 99 63 46',
      contact_location: 'Lomé, Togo',
      social_instagram: '#',
      social_facebook: '#',
      social_youtube: '#',
      social_tiktok: '',
    }
    for (const [k, v] of Object.entries(defaults)) ins.run(k, v)
    console.log('[seed] réglages initialisés')
  }

  if (db.prepare('SELECT COUNT(*) AS c FROM team_members').get().c === 0) {
    const ins = db.prepare(
      'INSERT INTO team_members (name, role, bio, slug, parent_id, position, visible) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    const team = [
      ['AMEGNAGLO K.S', 'Graphiste Designer', "Graphiste passionné avec une solide expertise dans la conception visuelle, j'apporte des solutions créatives et stratégiques aux projets de mes clients.", null, 0],
      ['TAMEGNON K.K', 'Monteur vidéo · YouTube', 'Monteur vidéo et créateur de contenus courts pour les réseaux et YouTube.', null, 1],
      ['GEORGE', 'Web designer', 'Web designer chez Nova, je conçois des interfaces élégantes et performantes.', null, 2],
    ]
    for (const [name, role, bio, parent, pos] of team) {
      ins.run(name, role, bio, uniqueSlug('team_members', slugify(name)), parent, pos, 1)
    }
    console.log('[seed] équipe initialisée')
  }

  if (db.prepare('SELECT COUNT(*) AS c FROM portfolio_items').get().c === 0) {
    const ins = db.prepare(
      'INSERT INTO portfolio_items (title, slug, category, description, position, visible) VALUES (?, ?, ?, ?, ?, ?)',
    )
    const items = [
      ['Charte Visiosphere', 'Logo', 'Identité visuelle complète pour Visiosphere.'],
      ['Affiche événement', 'Flyers', 'Affiche publicitaire pour un événement.'],
      ['Teaser produit', 'Motion design', 'Animation teaser de lancement produit.'],
      ['Packaging 3D', '3D', 'Visualisation 3D de packaging.'],
      ['Illustration 2D', '2D', 'Illustration vectorielle 2D.'],
      ['Shooting corporate', 'Photographie', 'Séance photo corporate.'],
    ]
    items.forEach(([title, category, description], i) => {
      ins.run(title, uniqueSlug('portfolio_items', slugify(title)), category, description, i, 1)
    })
    console.log('[seed] portfolio initialisé')
  }
}
