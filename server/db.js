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
    title      TEXT NOT NULL DEFAULT '',
    body       TEXT NOT NULL DEFAULT '',
    visible    INTEGER NOT NULL DEFAULT 1,
    position   INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`)

// First-run seed: one admin account + the home-page sections from the design.
export function seed() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@novagraphik.fr').toLowerCase()
  const adminPassword = process.env.ADMIN_PASSWORD || 'NovaAdmin2026!'

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail)
  if (!exists) {
    const hash = bcrypt.hashSync(adminPassword, 10)
    db.prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)').run(adminEmail, hash, 'admin')
    console.log(`[seed] admin créé → ${adminEmail} / ${adminPassword}  (changez le mot de passe en production)`)
  }

  const { c } = db.prepare('SELECT COUNT(*) AS c FROM sections WHERE page = ?').get('home')
  if (c === 0) {
    const ins = db.prepare('INSERT INTO sections (page, type, title, body, visible, position) VALUES (?, ?, ?, ?, ?, ?)')
    const rows = [
      ['home', 'Hero', "L'essence du raffinement visuel.", "Nous accompagnons les entreprises, marques et particuliers dans la création d'une communication visuelle forte, moderne et impactante.", 1, 0],
      ['home', 'Services', 'Tout ce qui est lié au digital', "De l'identité de marque au motion design, nous couvrons l'ensemble de votre communication visuelle.", 1, 1],
      ['home', 'Portfolios', 'Notre univers créatif', 'Une sélection de nos réalisations récentes.', 1, 2],
      ['home', 'Équipe', "L'équipe Nova", 'Une équipe passionnée qui met sa créativité et son sens du détail au service de votre réussite.', 1, 3],
    ]
    for (const r of rows) ins.run(...r)
    console.log('[seed] sections de la page d’accueil initialisées')
  }
}
