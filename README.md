# Nova Graphik Visu — Site vitrine + CMS d'une agence de communication visuelle

![Vue](https://img.shields.io/badge/Vue-3-4FC08D?logo=vue.js&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Nuxt UI](https://img.shields.io/badge/Nuxt_UI-4-00DC82?logo=nuxt.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Storage%20%2B%20Auth-3FCF8E?logo=supabase&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-3-88CE02?logo=greensock&logoColor=white)
![Railway](https://img.shields.io/badge/Hébergement-Railway-0B0D0E?logo=railway&logoColor=white)

🔗 **Site en production** : <https://novagraphikvisu.com/>
📦 **Code source** : <https://github.com/Georginio-prod/NovaGraphik>

---

## 📌 Présentation

Site professionnel de **Nova Graphik Visu**, agence de communication visuelle (identité
de marque, print, motion design, 3D, photo, sites web). Projet client réel, livré et en
production.

Particularité : c'est un **site vitrine entièrement administrable** (CMS maison) **sans
backend à maintenir**. Le front Vue parle directement à **Supabase** (Postgres + Storage
+ Auth) avec des règles RLS : lecture publique, écriture réservée aux administrateurs
connectés. Chaque page est **pré-rendue en HTML statique** au build (Puppeteer) pour le SEO.

## ✨ Fonctionnalités

### Site public
- Accueil, **portfolio** (fiches projet `/portfolio/:slug`), **blog** (`/blogs/:slug`), **promotions** avec pages de détail, **équipe** (`/equipe/:slug`), **partenaires**, **grille tarifaire**, page dédiée « Site web pour VTC », **contact**.
- Formulaire « **Demander un devis** » avec pièce jointe : upload dans un bucket Supabase, puis e-mail brandé envoyé via la fonction Edge `send-quote` (Resend), repli FormSubmit.
- Animations GSAP (reveal au scroll, curseur lumineux, barre de progression de route), lightbox médias, lecteur vidéo, QR codes, thème clair / sombre.
- SEO : titres / descriptions par route (`@unhead/vue`), `sitemap.xml` généré au build, `robots.txt`, pré-rendu HTML.

### Espace d'administration (`/admin`)
- Connexion Supabase Auth.
- Édition **en place** de tout le contenu : pages / sections, services, portfolio, équipe (organigramme), articles, promotions, partenaires, tarifs (groupes de formules, codes promo), navigation, footer, paramètres.
- **Gestion des commandes / devis** reçus.
- Outils d'édition : recadrage d'images, sélecteur d'icônes, modèles de sections, listes d'entités réordonnables, champs médias avec upload direct vers Supabase Storage.

## 🏗️ Architecture

```text
Navigateur ──► Vue 3 SPA (pré-rendue) ──► Supabase
                                          ├── Postgres (contenu, RLS)
                                          ├── Storage (bucket `media`, `quote-files`)
                                          ├── Auth (login admin)
                                          └── Edge Function `send-quote` → Resend
```

| Table Supabase | Contenu |
|---|---|
| `sections`, `nav_items`, `settings` | Structure et réglages du site |
| `services`, `pricing_items`, `pricing_formulas` | Offres et tarifs |
| `portfolio_items`, `articles`, `team_members`, `partners`, `testimonials` | Contenus éditoriaux |

## 📁 Structure du projet

```
NovaGraphik/
├── package.json              # Workspace npm (un seul paquet : app)
├── nixpacks.toml             # Build Railway : Node 22 + Chromium (pré-rendu)
├── DEPLOY.md · MIGRATION.md · EMAIL_SETUP.md
├── supabase/
│   ├── schema.sql            # Tables + RLS + buckets (à exécuter une fois)
│   └── functions/send-quote/ # Fonction Edge d'envoi d'e-mail de devis
├── scripts/
│   ├── gen-sitemap.mjs       # sitemap.xml
│   ├── prerender.mjs         # Pré-rendu HTML de chaque route (Puppeteer)
│   ├── serve.mjs             # Serveur statique clean-URL pour la prod
│   └── migrate-to-supabase.ts
└── app/
    ├── .env.example
    ├── src/main.ts           # Routes + garde d'authentification admin
    ├── src/pages/            # HomePage, PortfolioPage, BlogPage, PricingPage, VtcPage,
    │   └── dashboard/        # DashboardOverview, DashboardPortfolio, DashboardOrders…
    ├── src/components/
    │   ├── base/             # NButton, NField, ThemeToggle, MediaLightbox, VideoPlayer, NQrCode…
    │   ├── sections/         # AboutSection, CmsContentSection, CtaBand, TeamOrgChart…
    │   ├── dashboard/        # ImageCropper, IconPicker, PricingGroupsEditor, TemplatePickerModal…
    │   └── layout/           # NavBar, SiteFooter
    ├── src/composables/      # useAuth, useEditable, useSiteContent, useUpload, useSeo, useTheme…
    └── src/lib/              # api.ts (couche données Supabase), supabase.ts, gsap.ts, seo.ts, qr.ts…
```

## 🚀 Installation & lancement

Prérequis : **Node.js ≥ 22.12**, un projet Supabase.

```bash
git clone https://github.com/Georginio-prod/NovaGraphik.git
cd NovaGraphik
npm install
cp app/.env.example app/.env       # renseigner les variables ci-dessous
npm run dev                        # http://localhost:5173
```

| Variable (`app/.env`) | Description |
|---|---|
| `VITE_SUPABASE_URL` | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé anonyme (publique) |
| `VITE_SUPABASE_BUCKET` | Bucket de médias (`media`) |

Première mise en place de Supabase : exécuter `supabase/schema.sql` dans le SQL Editor
(crée tables, RLS et buckets), puis créer un utilisateur dans **Authentication** pour l'admin.

| Commande | Description |
|---|---|
| `npm run dev` | Front Vite en développement |
| `npm run build` | sitemap → `vue-tsc` → `vite build` → pré-rendu HTML |
| `npm start` | Sert `app/dist` (production) |
| `npm run migrate:supabase` | Migration one-shot depuis l'ancien backend |

## 🌐 Déploiement

Hébergé sur **Railway** en un seul service statique (`nixpacks.toml`) avec le domaine
`novagraphikvisu.com`. Les seules variables nécessaires sont les trois `VITE_SUPABASE_*`.
Le pré-rendu utilise le Chromium fourni par Nix ; s'il est indisponible, le build livre
la SPA sans échouer. Détails : [DEPLOY.md](DEPLOY.md), e-mail de devis : [EMAIL_SETUP.md](EMAIL_SETUP.md).

## 🎓 Ce que ce projet démontre

Livraison d'un site client en production, conception d'un CMS sur mesure, architecture
*serverless* avec Supabase (RLS, Storage, Edge Functions), SEO d'une SPA (pré-rendu,
sitemap, meta par route), animations GSAP, design system de composants `N*`.

---

## 👤 Auteur

**Komla Etonam Georges EKLOU** (Georginio) — Développeur Full Stack Web & Web3

[![GitHub](https://img.shields.io/badge/GitHub-Georginio--prod-181717?logo=github)](https://github.com/Georginio-prod)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Profil-0A66C2?logo=linkedin)](https://www.linkedin.com/in/komla-etonam-georges-eklou-68518b23b)
[![Portfolio](https://img.shields.io/badge/Portfolio-georginio.w3frame.com-6C63FF)](https://georginio.w3frame.com/)

> 📚 Tous mes projets sont listés et documentés sur mon [profil GitHub](https://github.com/Georginio-prod).
