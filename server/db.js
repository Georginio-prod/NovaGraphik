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
ensureColumn('portfolio_items', 'external_url', "TEXT NOT NULL DEFAULT ''")

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
      ['AMEGNAGLO K.S', 'Graphiste Designer de NOVA', "Graphiste passionné avec une solide expertise dans la conception visuelle, j'apporte des solutions créatives et stratégiques aux projets de mes clients. Mon approche vise à allier esthétique, efficacité et innovation pour créer des visuels qui se démarquent et qui communiquent efficacement l'identité de chaque marque. Avec une maîtrise de divers outils graphiques et une sensibilité artistique, je m'engage à réaliser des projets impactants et de haute qualité.", null, 0],
      ['TAMEGNON K.K', 'Monteur vidéo · short YouTube de NOVA', "Monteur vidéo passionné, doté d'une solide expertise dans la création et l'optimisation de contenus audiovisuels, j'accompagne mes clients dans la réalisation de projets dynamiques, percutants et stratégiques. Mon approche consiste à transformer chaque idée en une vidéo captivante, en combinant rythme, storytelling et qualité visuelle afin de transmettre efficacement le message et l'identité de chaque marque. Grâce à ma maîtrise des outils de montage et à mon sens du détail, je m'engage à produire des contenus modernes, engageants et à forte valeur ajoutée, adaptés aux réseaux sociaux, au marketing digital et aux projets professionnels.", 'AMEGNAGLO K.S', 1],
      ['GEORGE', 'Web designer de NOVA', "EKLOU Komla Etonam Georges est un développeur Web & Web3 basé à Lomé, titulaire d'une Licence en Informatique – Développement d'Applications (UCAO-UUT). Il maîtrise des technologies modernes telles que Vue.js, Nuxt.js, TypeScript, TailwindCSS, Node.js et WordPress, ainsi que le développement blockchain avec Solidity. Ses expériences en stage lui ont permis de consolider ses compétences en intégration front-end, développement d'applications et analyse de données. Curieux et animé par l'apprentissage continu, il aspire à contribuer à des solutions innovantes alliant web moderne et architectures décentralisées.", 'AMEGNAGLO K.S', 2],
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
      'INSERT INTO portfolio_items (title, slug, category, description, cover_image, images, external_url, position, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    // Each "showcase" item groups several visuals so the detail page acts like a
    // mini-gallery — clicking the card reveals plusieurs réalisations.
    // [title, category, description, cover, images[], external_url]
    const items = [
      // LOGO showcase
      [
        'Logo & identités',
        'Logo',
        "Une sélection de logos et déclinaisons d’identité réalisés pour les marques accompagnées par Nova.",
        '/uploads/samuel-logo-aridas.jpg',
        [
          '/uploads/samuel-logo-mak.jpg',
          '/uploads/samuel-logo-tshirt.jpg',
          '/uploads/samuel-logo-cart2.jpg',
          '/uploads/samuel-logo-etik.jpg',
          '/uploads/samuel-logo-iphone.jpg',
        ],
        '',
      ],
      // FLYERS showcase
      [
        'Flyers & affiches',
        'Flyers',
        "Affiches commerciales et flyers évènementiels — restauration, lancements, campagnes saisonnières.",
        '/uploads/samuel-flyer-cookies.jpg',
        [
          '/uploads/samuel-flyer-cake.jpg',
          '/uploads/samuel-flyer-cafe.jpg',
          '/uploads/samuel-flyer-caff.jpg',
          '/uploads/samuel-flyer-jour1.jpg',
          '/uploads/wp-flyer-rentree.jpg',
          '/uploads/wp-flyer-aout.png',
        ],
        '',
      ],
      // MOTION (placeholder — visuals arrive)
      [
        'Motion design',
        'Motion design',
        "Habillages, teasers et formats courts pour les réseaux. D’autres réalisations arrivent prochainement.",
        '/uploads/wp-dream-cover.jpg',
        [],
        '',
      ],
      // SHOOTING showcase
      [
        'Shootings & direction artistique',
        'Shooting',
        "Direction artistique et prises de vue éditoriales — mode, beauté, campagnes produits.",
        '/uploads/samuel-shooting-1.jpg',
        [
          '/uploads/samuel-shooting-2.jpg',
          '/uploads/samuel-shooting-3.jpg',
          '/uploads/samuel-shooting-4.jpg',
          '/uploads/samuel-shooting-lash.jpg',
        ],
        '',
      ],
      // WEB PROJET — 4 live deployments scraped via thum.io
      [
        'Audiophile e-commerce',
        'Web Projet',
        "E-commerce audio premium — fiche produit, panier et tunnel d’achat soignés, interface haut de gamme.",
        '/uploads/web-audiophile.jpg',
        [],
        'https://audiophile-ecommerce-psi-ecru.vercel.app/',
      ],
      [
        'Pomodoro App',
        'Web Projet',
        "Application de productivité — minuteur Pomodoro, suivi de cycles de travail et de pauses.",
        '/uploads/web-pomodoro.jpg',
        [],
        'https://promodoro-app-iota.vercel.app/',
      ],
      [
        'CNC Portal',
        'Web Projet',
        "Portail métier industriel — gestion d’opérations CNC, tableau de bord et orchestration des flux.",
        '/uploads/web-cnc.jpg',
        [],
        'https://app.cncportal.io/',
      ],
      [
        'Orga Africa',
        'Web Projet',
        "Site institutionnel d’Orga Africa — communication corporate et présentation des activités.",
        '/uploads/web-orga.jpg',
        [],
        'https://www.orga-africa.com/',
      ],
    ]
    items.forEach(([title, category, description, cover, images, externalUrl], i) => {
      ins.run(
        title,
        uniqueSlug('portfolio_items', slugify(title)),
        category,
        description,
        cover,
        JSON.stringify(images || []),
        externalUrl || '',
        i,
        1,
      )
    })
    console.log('[seed] portfolio initialisé')
  }
}
