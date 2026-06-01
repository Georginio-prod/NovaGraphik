# Architecture & déploiement

## Structure du repo

Monorepo npm avec deux *workspaces* indépendants :

```
NovaGraphik/
├── app/                # Frontend Vue 3 + Vite + Tailwind v4
│   ├── src/            # composants, pages, composables
│   ├── public/         # assets statiques (logo, icons.svg)
│   ├── index.html
│   ├── vite.config.ts  # alias @ + proxy /api → backend
│   ├── package.json
│   ├── nixpacks.toml   # config Railway
│   └── .env.example
├── backend/            # Backend Express + SQLite + uploads disque
│   ├── src/
│   │   ├── index.js    # routes API
│   │   ├── auth.js     # vérif JWT Supabase via JWKS
│   │   └── db.js       # SQLite + seeds
│   ├── uploads/        # médias (seeds samuel-*, wp-* en git, reste runtime)
│   ├── data.sqlite     # créé au runtime, gitignored
│   ├── package.json
│   ├── nixpacks.toml   # config Railway
│   └── .env.example
├── package.json        # workspaces + scripts globaux dev/build
├── railway.json
└── README.md
```

Les deux workspaces partagent un seul `node_modules/` hoisté à la racine
(grâce à `"workspaces": ["app", "backend"]`), donc **un seul `npm install`**
à la racine installe tout.

## Quickstart local

```bash
git clone git@github.com:Georginio-prod/NovaGraphik.git
cd NovaGraphik
npm install              # hoist app + backend deps

# Copier les .env d'exemple et renseigner les vraies valeurs Supabase
cp app/.env.example app/.env
cp backend/.env.example backend/.env

# Démarrer frontend (5173) + backend (3001) en parallèle
npm run dev
```

Scripts globaux disponibles :

| Commande | Effet |
|---|---|
| `npm run dev` | lance frontend + backend en parallèle |
| `npm run dev:app` | frontend seul |
| `npm run dev:api` | backend seul (`node --watch`) |
| `npm run build` | build prod du frontend → `app/dist/` |

## Déploiement sur Railway

Railway gère nativement les monorepos : on crée **deux services** dans le
même projet, chacun avec sa "Root Directory" pointée sur un workspace.

### 1. Créer le projet Railway

1. https://railway.app → **New Project** → **Deploy from GitHub repo**
2. Sélectionne `Georginio-prod/NovaGraphik`, branche `develop`
3. Railway propose un premier service par défaut — on va le configurer
   pour le **backend**, puis on ajoutera le frontend.

### 2. Service `backend`

**Settings → General**
- Root Directory : `backend`
- Branch : `develop`
- Watch Paths : `backend/**`

**Settings → Variables** (ajoute) :

| Clé | Valeur |
|---|---|
| `PORT` | `3001` |
| `SUPABASE_URL` | `https://iksyoxumzctnwxeziiad.supabase.co` |
| `DB_PATH` | `/data/data.sqlite` |
| `UPLOADS_DIR` | `/data/uploads` |

**Settings → Volumes → Add Volume**
- Mount Path : `/data`
- Taille : 1 GB (suffisant pour SQLite + uploads)

→ Railway redéploie. Une fois UP, note l'URL publique
(forme `https://novagraphik-backend-production.up.railway.app`).

### 3. Service `app`

Sur le même projet : **+ New → GitHub Repo** → même repo.

**Settings → General**
- Root Directory : `app`
- Branch : `develop`
- Watch Paths : `app/**`

**Settings → Variables** :

| Clé | Valeur |
|---|---|
| `VITE_SUPABASE_URL` | `https://iksyoxumzctnwxeziiad.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | (la anon key Supabase) |
| `VITE_API_BASE_URL` | l'URL du service backend (sans `/api` à la fin) |

**Settings → Networking → Generate Domain**
→ Railway expose le frontend sur une URL publique.

### 4. Vérifs post-déploiement

- `https://<frontend>.up.railway.app/` → page d'accueil chargée
- `https://<frontend>.up.railway.app/admin/team` → page admin (login si besoin)
- `https://<backend>.up.railway.app/api/services` → JSON des 8 services

## Notes & considérations prod

- **SQLite ↔ Volume** : avec le volume monté à `/data` et `DB_PATH=/data/data.sqlite`,
  la base survit aux deploy. Les seeds s'appliquent automatiquement sur les
  tables vides au premier démarrage (logique idempotente dans `backend/src/db.js`).
- **Uploads** : `UPLOADS_DIR=/data/uploads` les met sur le même volume.
- **JWKS** : pas de secret à gérer côté backend — l'URL est dérivée de
  `SUPABASE_URL`. Si tu fais tourner sur un autre projet Supabase, change
  uniquement `SUPABASE_URL` (et la `VITE_SUPABASE_URL` côté frontend).
- **Backend = repo public** : aucun secret sensible (`SUPABASE_URL` peut être
  exposé sans risque ; la signature des tokens reste vérifiée par la clé
  publique JWKS).
- **Cold start** : le free Railway endort le service après inactivité. Premier
  appel après une pause = ~5–10 s. Pour de la prod sérieuse, plan payant.

## Alternative : tout sur Railway dans un seul service ?

Possible si tu veux simplifier au prix de la performance frontend :
1. Garder uniquement le service `backend`
2. Ajouter `npm install && npm run build` (qui build `app/`) dans la
   commande d'install Nixpacks
3. Le backend sert `app/dist/` via la SPA fallback déjà codée
   (`STATIC_DIR` pointé sur `../app/dist`)

Pas recommandé : on perd le CDN edge frontend et on couple le redémarrage.
