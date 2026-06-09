# Configuration de l'e-mail de devis (EmailJS)

Le formulaire « Demander un devis » envoie un e-mail **brandé** (logo Nova) à
**contact@novagraphik.fr**. Tant que les clés EmailJS ne sont pas renseignées, le
formulaire bascule automatiquement sur FormSubmit (e-mail simple, sans logo) —
donc rien n'est cassé en attendant.

Une pièce jointe éventuelle est **uploadée dans Supabase Storage** (bucket
`quote-files`) et son **lien de téléchargement** est inclus dans l'e-mail.

## 1. Créer un compte EmailJS (gratuit)
1. Va sur https://www.emailjs.com → **Sign Up** (gratuit, 200 e-mails/mois).

## 2. Connecter une boîte mail (Email Service)
1. **Email Services → Add New Service** → choisis **Gmail** (ou autre) et connecte
   la boîte qui **enverra** les e-mails (idéalement `contact@novagraphik.fr`).
2. Note le **Service ID** (ex. `service_xxxxxxx`).

## 3. Créer le Template
**Email Templates → Create New Template**. Renseigne :
- **To Email** : `contact@novagraphik.fr`
- **From Name** : `Nova Graphik — Devis`
- **Reply To** : `{{email}}`
- **Subject** : `Nouvelle demande de devis — {{name}}`
- **Content** : passe l'éditeur en mode **HTML** (`<>`) et colle ceci :

```html
<div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:0 auto;border:1px solid #e6ecec;border-radius:12px;overflow:hidden">
  <div style="background:#022c3d;padding:24px;text-align:center">
    <img src="https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/email-logo.png" alt="Nova Graphik" width="190" style="display:block;margin:0 auto"/>
  </div>
  <div style="padding:28px">
    <h2 style="color:#022c3d;margin:0 0 4px;font-size:20px">Nouvelle demande de devis</h2>
    <p style="color:#6b7d83;margin:0 0 20px;font-size:13px">Reçue via le site novagraphik.fr</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;color:#0c1a1f">
      <tr><td style="padding:8px 0;color:#6b7d83;width:130px">Nom</td><td style="padding:8px 0;font-weight:bold">{{name}}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7d83">E-mail</td><td style="padding:8px 0"><a href="mailto:{{email}}" style="color:#02735e">{{email}}</a></td></tr>
      <tr><td style="padding:8px 0;color:#6b7d83">Services</td><td style="padding:8px 0">{{services}}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7d83;vertical-align:top">Message</td><td style="padding:8px 0;white-space:pre-line">{{message}}</td></tr>
      <tr><td style="padding:8px 0;color:#6b7d83">Pièce jointe</td><td style="padding:8px 0"><a href="{{file_url}}" style="color:#02735e">{{file_name}}</a></td></tr>
    </table>
  </div>
  <div style="background:#f1f5f4;padding:16px 28px;text-align:center;color:#8aa1a4;font-size:11px">
    Répondez directement à cet e-mail pour contacter le client.
  </div>
</div>
```

Note le **Template ID** (ex. `template_xxxxxxx`).

## 4. Récupérer la clé publique
**Account → General → Public Key** (ex. `xxxxxxxxxxxxxxxx`).

## 5. Renseigner les 3 clés
Dans `app/.env` (en local) **et** dans les variables du service Railway :
```
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
```
Puis **rebuild / redeploy** (Vite injecte ces variables au build).

Une fois fait, chaque demande de devis arrive en e-mail brandé sur
`contact@novagraphik.fr`, avec le lien de la pièce jointe si le client en a joint une.

## Récupérer les e-mails de la newsletter (bloc « S'abonner »)
Les inscriptions sont stockées dans la table Supabase `subscribers`. Pour les
exporter : Supabase → **Table Editor → subscribers** (ou SQL `select email from subscribers`).
