# Déploiement Nova Graphik

Le stack actuel sépare proprement **frontend statique** (Vite/Vue) et **backend Node**
(Express + SQLite + uploads sur disque). Vercel seul ne peut pas tout porter à cause
de SQLite et de l’écriture des images sur disque, donc on déploie en deux moitiés.

```
┌─────────────────────┐         ┌─────────────────────────┐
│  Vercel (statique)  │  /api/* │  Render (Node + disque) │
│  dist/  +  rewrite  │ ──────▶ │  node server/index.js   │
│                     │ /uploads│  /var/data/data.sqlite  │
└─────────────────────┘         └─────────────────────────┘
```

## 1. Backend sur Render

1. Crée un compte sur https://render.com (GitHub OAuth).
2. **New → Blueprint**, sélectionne ce repo (`Georginio-prod/NovaGraphik`).
   Render détecte `render.yaml` à la racine et propose la création du service +
   du disque persistant.
3. Renseigne les **deux variables** marquées `sync: false` :
   - `VITE_SUPABASE_URL` → `https://iksyoxumzctnwxeziiad.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` → la valeur depuis `.env`
4. Clique **Create resources**. Premier build = 2-3 min.
5. Note l’URL publique attribuée (forme : `https://novagraphik-api.onrender.com`).

Notes utiles :
- Le disque (`/var/data`, 1 GB) survit aux déploiements → SQLite et uploads
  persistent.
- Le free plan endort le service après 15 min sans trafic ; premier appel après
  une pause = ~30 s de cold start.
- Pour de la prod sérieuse, passer au plan **Starter** (~7 $/mois) qui garde
  le service éveillé.

## 2. Frontend sur Vercel

1. **Add New → Project**, sélectionne le repo (`develop`).
2. Vercel lit `vercel.json` et utilise automatiquement `vite` comme framework.
3. **Avant le premier déploiement**, édite `vercel.json` et remplace les deux
   occurrences de `VOTRE-BACKEND.onrender.com` par l’URL Render obtenue à
   l’étape précédente. Commit + push (`vercel` redéploiera tout seul).
4. Dans **Project Settings → Environment Variables**, ajoute :
   - `VITE_SUPABASE_URL` = `https://iksyoxumzctnwxeziiad.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = (même valeur que sur Render)
   - `VITE_API_BASE_URL` = `https://novagraphik-api.onrender.com`

   **⚠ Ne PAS** mettre `/api` à la fin de `VITE_API_BASE_URL` — le helper
   `src/lib/api.ts` l’ajoute.
5. Redéploie depuis l’onglet **Deployments**.

## 3. Vérifs post-déploiement

- `https://<vercel>/` → page d’accueil avec hero, services, portfolio teaser.
- `https://<vercel>/admin/team` → page admin (login si pas connecté). Si tu
  vois encore 404, vérifie que les `rewrites` de `vercel.json` matchent (ne
  retire pas la regex « catch-all » de la 3ᵉ rewrite).
- `https://<backend>/api/services` → JSON des 8 services. Si HTML/erreur,
  Render n’a pas démarré → check les logs.

## Alternative envisagée plus tard : tout sur Vercel + Supabase Postgres

Ça nécessite :
- Migrer le schéma SQLite (`server/db.js`) vers Postgres dans Supabase.
- Migrer `server/uploads/` vers Supabase Storage.
- Réécrire `server/index.js` en fonctions Vercel (`api/*.ts`) ou utiliser
  directement `@supabase/supabase-js` côté frontend avec des RLS policies.

≈ 2 h de travail. À faire seulement si le free Render devient trop limitant.
