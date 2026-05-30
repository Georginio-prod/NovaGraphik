import { DatabaseSync } from 'node:sqlite'
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

// First-run seed: home sections, settings, team and portfolio.
// Auth users are managed by Supabase, not in this SQLite database.
export function seed() {
  if (db.prepare('SELECT COUNT(*) AS c FROM sections WHERE page = ?').get('home').c === 0) {
    const ins = db.prepare(
      'INSERT INTO sections (page, type, template, title, body, visible, position) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    const rows = [
      ['home', 'Hero', 'hero', "L'essence du raffinement visuel.", "Nous accompagnons les entreprises, marques et particuliers dans la création d'une communication visuelle forte, moderne et impactante.", 1, 0],
      ['home', 'Qui sommes-nous', 'text', 'Une agence créative au service des marques.', "Agence créative basée à Lomé, Nova Graphik bâtit des identités visuelles fortes et durables — direction artistique, design graphique, motion design, web et production audiovisuelle. Notre ambition : devenir une référence en Afrique de l'Ouest en transformant les idées de nos clients en projets concrets, performants et porteurs de sens.", 1, 1],
      ['home', 'Services', 'services', 'Tout ce qui est lié au digital', "De l'identité de marque au motion design, nous couvrons l'ensemble de votre communication visuelle.", 1, 2],
      ['home', 'Portfolios', 'portfolio', 'Notre univers créatif', 'Une sélection de nos réalisations récentes.', 1, 3],
      ['home', 'Équipe', 'team', "L'équipe Nova", 'Une équipe pluridisciplinaire qui met sa créativité et son sens du détail au service de votre réussite.', 1, 4],
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
      social_tiktok: '#',
    }
    for (const [k, v] of Object.entries(defaults)) ins.run(k, v)
    console.log('[seed] réglages initialisés')
  }

  if (db.prepare('SELECT COUNT(*) AS c FROM team_members').get().c === 0) {
    const ins = db.prepare(
      'INSERT INTO team_members (name, role, bio, slug, parent_id, position, visible) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    // [name, role, bio, parentName (null = root), position]
    // Pyramidal hierarchy: 1 → 2 → 2 (grows as you add more members later).
    const team = [
      ['AMEGNAGLO K.S', 'Graphiste Designer de NOVA', "Direction artistique et identité visuelle. Logos, chartes graphiques et supports imprimés — Samuel met son œil et sa rigueur au service d'identités fortes, cohérentes et mémorables.", null, 0],
      ['TAMEGNON K.K', 'Monteur vidéo · short YouTube de NOVA', "Monteur vidéo et créateur de contenu. Spécialisé dans les formats courts, les capsules YouTube et les motion teasers pour les marques qui veulent capter l'attention en moins de 30 secondes.", 'AMEGNAGLO K.S', 1],
      ['GEORGE', 'Web designer de NOVA', 'Web designer chez Nova. Conçoit des interfaces élégantes, performantes et orientées conversion — sites vitrine, e-commerce et plateformes sur mesure.', 'AMEGNAGLO K.S', 2],
      ['BANAWOYE Eliezer', 'Réalisateur · Cadreur · Monteur', "Réalisateur et chef opérateur. Cadreur, monteur et éclaireur — Eliezer signe la captation et la post-production des reportages, films corporate et clips musicaux de l'agence. Formation Bac+2 FLLA.", 'TAMEGNON K.K', 3],
      ['FIA Yaovi Daniel', 'Responsable marketing & community manager', "Responsable marketing et community manager chez Nova. Gestionnaire des ressources humaines de formation, photographe et vidéaste, Daniel orchestre la stratégie de présence digitale et l'image de marque de l'agence. Aussi mannequin et musicien à ses heures.", 'GEORGE', 4],
    ]
    const idByName = {}
    for (const [name, role, bio, parentName, pos] of team) {
      const slug = uniqueSlug('team_members', slugify(name))
      const parent = parentName ? idByName[parentName] : null
      const info = ins.run(name, role, bio, slug, parent, pos, 1)
      idByName[name] = Number(info.lastInsertRowid)
    }
    console.log('[seed] équipe initialisée')
  }

  if (db.prepare('SELECT COUNT(*) AS c FROM portfolio_items').get().c === 0) {
    const ins = db.prepare(
      'INSERT INTO portfolio_items (title, slug, category, description, cover_image, position, visible) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    const items = [
      ['Logo ANIEL', 'Logo', "Identité visuelle pour Aniel — signe net, posture haut de gamme.", '/uploads/wp-logo-aniel.png'],
      ['Identité Nova', 'Logo', "Identité visuelle de l'agence Nova Graphik.", '/uploads/wp-nova-identity.jpg'],
      ['Carte de visite premium', 'Supports imprimés', 'Conception et impression d’une carte de visite 300g finition laminée.', '/uploads/wp-carte-pro.jpg'],
      ['Flyer rentrée', 'Flyers', 'Affiche promotionnelle de campagne rentrée.', '/uploads/wp-flyer-rentree.jpg'],
      ['Flyer août', 'Flyers', 'Affiche événementielle été.', '/uploads/wp-flyer-aout.png'],
      ['Concept flyer carré', 'Flyers', 'Concept de flyer carré, mise en page éditoriale.', '/uploads/wp-flyer-mockup.jpg'],
      ['Packaging produit', '3D', 'Mise en scène produit — textile / packaging.', '/uploads/wp-packaging-casquette.jpg'],
      ['Direction artistique pâtisserie', 'Photographie', "Direction artistique et shooting produit pour la pâtisserie.", '/uploads/wp-cake.jpg'],
      ['Shooting matériel', 'Photographie', 'Reportage photo matériel et mise en scène.', '/uploads/wp-shooting-gear.jpg'],
      ['Visuel Samoussa', '2D', 'Visuel promotionnel street-food.', '/uploads/wp-samoussa.jpg'],
      ['Habillage Dream', 'Motion design', "Cover éditoriale et habillage motion.", '/uploads/wp-dream-cover.jpg'],
      ['Maquette web pro', 'UX/UI Web', "Direction artistique d'une maquette de site web.", '/uploads/wp-web-mockup.jpg'],
    ]
    items.forEach(([title, category, description, cover], i) => {
      ins.run(title, uniqueSlug('portfolio_items', slugify(title)), category, description, cover, i, 1)
    })
    console.log('[seed] portfolio initialisé')
  }
}
