# Migration : backend Express → Supabase (Postgres + Storage)

Objectif : **retirer le backend Express + SQLite + uploads disque**. Le contenu
passe sur **Supabase Postgres**, les médias sur **Supabase Storage**. Le front
(statique) parle directement à Supabase. Plus de serveur à maintenir, pas de
volume, pas de cold start.

```
AVANT                                  APRÈS
Front ─▶ Express API ─▶ SQLite         Front ─▶ Supabase Postgres (RLS)
                    └─▶ disk /uploads          └─▶ Supabase Storage (bucket media)
Supabase = auth seulement              Supabase = auth + data + médias
```

L'autorisation est identique à aujourd'hui : **lecture publique du contenu
visible, écriture pour tout utilisateur Supabase connecté** (login admin
partagé). C'est appliqué par les politiques RLS, plus par un backend.

---

## Étape 1 — Créer le schéma dans Supabase

Dans le projet Supabase (le même que celui utilisé pour le login) :

1. **SQL Editor → New query**, colle tout `supabase/schema.sql`, **Run**.
   Ça crée les 11 tables, les politiques RLS, et le bucket Storage `media`.
2. Vérifie : **Table editor** liste les tables, **Storage** montre le bucket
   `media` (public).

## Étape 2 — Migrer les données existantes

Tes données vivent aujourd'hui dans le SQLite + le dossier uploads du backend
(en prod : sur le volume Railway monté à `/data`).

1. Récupère localement (depuis le volume Railway, ou ton dev) :
   - `data.sqlite`
   - le dossier `uploads/`
2. Récupère la **service role key** Supabase : **Project Settings → API →
   service_role** (secret — ne jamais l'exposer côté client).
3. Lance le script depuis la racine du repo :

   ```bash
   SUPABASE_URL=https://<ref>.supabase.co \
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key> \
   DB_PATH=./backend/data.sqlite \
   UPLOADS_DIR=./backend/uploads \
   node scripts/migrate-to-supabase.mjs
   ```

   Le script : téléverse tous les fichiers dans le bucket `media`, copie chaque
   table, et **réécrit les URLs** `/uploads/…` → URL publique Storage (y compris
   les `?ar=` des formats vidéo).

4. Vérifie dans le dashboard Supabase que tables et médias sont bien là.

## Étape 3 — Brancher le front sur Supabase

Variables d'env du front (Railway service `app`, et `.env` local) :

```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_SUPABASE_BUCKET=media
```

Le code front qui faisait `api.get('/team')` (via le backend) appelle désormais
Supabase directement (`supabase.from('team_members')…`) et upload via
`supabase.storage.from('media')`. Cette bascule du data layer est la dernière
étape de code (voir « Cutover front » plus bas).

## Étape 4 — Déploiement Railway (front statique seul)

Le service `app` n'a plus besoin du service `backend` :

1. **Supprime le service `backend`** (et son volume) dans le projet Railway.
2. Le service `app` build le front et le sert en statique :
   - Build : `npm ci && npm run build` (génère `app/dist`)
   - Start : un serveur statique (`vite preview` ou `serve app/dist`)
3. Variables : les trois `VITE_…` ci-dessus.
4. **Networking → Generate Domain**.

Plus de `DB_PATH`, `UPLOADS_DIR`, `SUPABASE_URL` backend, ni volume.

---

## Cutover front (changements de code)

Réalisé sur la branche `feat/supabase-migration`. Résumé des fichiers touchés :

- **`lib/supabase.ts`** — inchangé (client déjà en place).
- **`lib/cms.ts`** (nouveau) — fonctions typées par entité (`listTeam`,
  `upsertSection`, `reorder`, …) basées sur `supabase.from(...)`.
- **`composables/useUpload.ts`** — `uploadImage` → `supabase.storage
  .from('media').upload()` puis `getPublicUrl()`.
- **6 composables** (`useTeam`, `usePortfolio`, `useSiteContent`, `useSettings`,
  `useEditable`, …) + **pages dashboard** — remplacent `api.*` par `cms.*`.
- **Suppression** de `lib/api.ts` (wrapper fetch backend).

## Ce qui est supprimé

- Tout le dossier **`backend/`** (Express, SQLite, uploads).
- Le proxy `/api` et `/uploads` de `vite.config.ts`.
- Le workspace `backend` de `package.json` racine.
- Les `nixpacks.toml` backend / monolithique.

## Rollback

La branche `develop` (et `feat/gsap-animations`) gardent l'architecture
backend ; tant que la bascule n'est pas mergée, rien n'est perdu.
