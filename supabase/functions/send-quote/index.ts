// Supabase Edge Function — sends a branded "demande de devis" email via Resend.
// Called by the public contact form (no JWT required). The Resend API key lives
// in the function secret RESEND_API_KEY and is never exposed to the browser.
//
// Deploy:
//   supabase functions deploy send-quote --project-ref <ref> --no-verify-jwt
//   supabase secrets set RESEND_API_KEY=re_xxx --project-ref <ref>

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const LOGO = 'https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/email-logo.png'
const INBOX = 'contact@novagraphik.fr'

const esc = (s: unknown) =>
  String(s ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string))

function buildHtml(d: {
  name: string; email: string; phone: string; services: string; message: string; file_url: string; file_name: string
}) {
  const fileBtn = d.file_url
    ? `<a href="${esc(d.file_url)}" style="display:inline-block;margin-top:24px;background:#022c3d;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 24px;border-radius:6px;font-size:14px;border:2px solid #0cf25d">⬇  Télécharger la pièce jointe${d.file_name ? ` (${esc(d.file_name)})` : ''}</a>`
    : ''
  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 0;color:#6b7d83;width:130px;vertical-align:top">${label}</td><td style="padding:8px 0;color:#0c1a1f">${value}</td></tr>`
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">
</head>
<body style="margin:0;padding:24px;background:#eef2f1;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e6ecec;border-radius:12px;overflow:hidden">
    <!-- logo on an explicit white panel so it stays visible in dark-mode clients -->
    <div style="background:#ffffff;padding:26px;text-align:center">
      <img src="${LOGO}" alt="Nova Graphik" width="190" style="display:block;margin:0 auto;background:#ffffff"/>
    </div>
    <div style="background:#022c3d;height:4px;font-size:0;line-height:0">&nbsp;</div>
    <div style="padding:28px;background:#ffffff">
      <h2 style="color:#022c3d;margin:0 0 4px;font-size:20px">Nouvelle demande de devis</h2>
      <p style="color:#6b7d83;margin:0 0 20px;font-size:13px">Reçue via le site novagraphik.fr</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${row('Nom', `<strong>${esc(d.name)}</strong>`)}
        ${row('E-mail', `<a href="mailto:${esc(d.email)}" style="color:#02735e">${esc(d.email)}</a>`)}
        ${row('Téléphone', d.phone ? `<a href="tel:${esc(d.phone)}" style="color:#02735e">${esc(d.phone)}</a>` : '—')}
        ${row('Services', esc(d.services) || '—')}
        ${row('Message', `<span style="white-space:pre-line">${esc(d.message)}</span>`)}
      </table>
      ${fileBtn}
    </div>
    <div style="background:#f1f5f4;padding:16px;text-align:center;color:#8aa1a4;font-size:11px">Répondez à cet e-mail pour contacter le client.</div>
  </div>
</body></html>`
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

  try {
    const b = await req.json()
    const d = {
      name: String(b.name ?? '').trim(),
      email: String(b.email ?? '').trim(),
      phone: String(b.phone ?? '').trim(),
      services: String(b.services ?? '').trim(),
      message: String(b.message ?? '').trim(),
      file_url: String(b.file_url ?? '').trim(),
      file_name: String(b.file_name ?? '').trim(),
    }
    if (!d.name || !d.email || !d.message) return json({ error: 'Champs requis manquants.' }, 400)

    const key = Deno.env.get('RESEND_API_KEY')
    if (!key) return json({ error: 'RESEND_API_KEY manquant.' }, 500)

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Nova Graphik <onboarding@resend.dev>',
        to: [INBOX],
        reply_to: d.email,
        subject: `Nouvelle demande de devis — ${d.name}`,
        html: buildHtml(d),
      }),
    })
    if (!r.ok) return json({ error: 'Envoi e-mail échoué.', detail: await r.text() }, 502)
    return json({ ok: true })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
