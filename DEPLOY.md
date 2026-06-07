# Architecture & déploiement

## Vue d'ensemble

Application **sans backend** : un front Vue statique qui parle directement à
**Supabase** (Postgres pour le contenu, Storage pour les médias, Auth pour le
login). Aucun serveur à maintenir, pas de base à héberger, pas de disque.

```
NovaGraphik/
├── app/                    # Frontend Vue 3 + Vite + Tailwind v4
│   ├── src/
│   │   ├── lib/api.ts      # data layer Supabase (Postgres, RLS)
│   │   ├── lib/supabase.ts # client Supabase (auth + data + storage)
│   │   ├── composables/useUpload.ts  # upload → Supabase Storage
│   │   └── …
│   ├── nixpacks.toml
│   └── .env.example
├── supabase/
│   └── schema.sql          # tables + RLS + bucket Storage (à exécuter 1x)
├── scripts/
│   └── migrate-to-supabase.mjs   # migration one-shot des anciennes données
├── nixpacks.toml           # déploiement Railway (front statique)
├── .mcp.json               # MCP Supabase (accès assisté au projet)
├── MIGRATION.md            # guide de migration depuis l'ancien backend
└── package.json            # workspace unique: app
```

## Quickstart local

```bash
npm install
cp app/.env.example app/.env   # renseigner VITE_SUPABASE_URL / ANON_KEY / BUCKET
npm run dev                    # front sur http://localhost:5173
```

| Commande | Effet |
|---|---|
| `npm run dev` | front (Vite) |
| `npm run build` | build prod → `app/dist/` |
| `npm start` | sert `app/dist` en statique (vite preview) |
| `npm run migrate:supabase` | migration des anciennes données → Supabase |

## Supabase (une fois)

1. **SQL Editor** → exécuter `supabase/schema.sql` (tables + RLS + bucket `media`).
2. (Si migration depuis l'ancien backend) suivre `MIGRATION.md`.
3. Récupérer `Project URL` et `anon key` (**Settings → API**).

Règles d'accès (RLS, identiques à l'ancien `requireAdmin`) : lecture publique
du contenu visible, écriture réservée aux utilisateurs Supabase connectés.

## Déploiement Railway (un seul service statique)

1. **New Project → Deploy from GitHub** → repo, branche voulue.
2. **Settings → General** : Root Directory = racine du repo (utilise
   `nixpacks.toml` : build du front + `npm start` qui sert `app/dist`).
3. **Settings → Variables** :

   | Clé | Valeur |
   |---|---|
   | `VITE_SUPABASE_URL` | `https://<ref>.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | (anon key) |
   | `VITE_SUPABASE_BUCKET` | `media` |

4. **Networking → Generate Domain**.

Plus de service backend, plus de volume, plus de `DB_PATH`/`UPLOADS_DIR`.

## Vérifs post-déploiement

- `/` charge la page d'accueil (contenu depuis Supabase).
- `/admin` → login Supabase, puis édition (écrit dans Postgres + Storage).
- Les médias s'affichent depuis `https://<ref>.supabase.co/storage/v1/object/public/media/…`.
