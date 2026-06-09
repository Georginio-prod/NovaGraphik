# E-mail de devis — Resend + fonction Supabase `send-quote`

Le formulaire « Demander un devis » envoie un e-mail **brandé** (logo Nova en
haut + bouton vert « Télécharger la pièce jointe ») à **contact@novagraphik.fr**.

## Comment ça marche
1. Le client remplit le formulaire (et peut joindre un fichier).
2. Le fichier est uploadé dans le bucket Supabase **`quote-files`** (public, max 10 Mo).
3. Le front appelle la fonction Edge **`send-quote`** (`supabase.functions.invoke`).
4. La fonction construit l'e-mail HTML brandé et l'envoie via **Resend**.
5. Repli automatique sur **FormSubmit** si la fonction est indisponible.

La clé Resend est stockée comme **secret** de la fonction (`RESEND_API_KEY`), jamais
exposée au navigateur. C'est **déjà configuré et déployé** — rien à faire.

## Fichiers
- Fonction : `supabase/functions/send-quote/index.ts`
- Logo de l'e-mail : `…/storage/v1/object/public/media/email-logo.png`

## Re-déployer la fonction (si modifiée)
```bash
supabase functions deploy send-quote --project-ref iksyoxumzctnwxeziiad --no-verify-jwt
# changer la clé Resend :
supabase secrets set RESEND_API_KEY=re_xxx --project-ref iksyoxumzctnwxeziiad
```
(Le CLI utilise la variable d'env `SUPABASE_ACCESS_TOKEN`. Pas besoin de Docker pour déployer.)

## Améliorer la délivrabilité (recommandé, optionnel)
Actuellement l'e-mail part de `onboarding@resend.dev` (peut arriver en spam).
Pour envoyer depuis **devis@novagraphik.fr** :
1. Resend → **Domains → Add Domain** → `novagraphik.fr`.
2. Ajoute les enregistrements DNS (SPF/DKIM) fournis chez ton registrar.
3. Une fois vérifié, change `from:` dans `supabase/functions/send-quote/index.ts`
   en `'Nova Graphik <devis@novagraphik.fr>'`, puis re-déploie.

## Newsletter (bloc « S'abonner »)
Les inscriptions sont dans la table Supabase `subscribers` (Table Editor → export).
