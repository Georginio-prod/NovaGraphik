// Supabase Edge Function — notifies about a new order placed with a Nova promo
// code. Sends a branded email via Resend to: Nova (proof of conversion), the
// merchant whose promo it is (if an address is provided), and the customer
// (confirmation). Called by the public promotion page (no JWT required). The
// Resend API key lives in the function secret RESEND_API_KEY, never in the browser.
//
// Deploy:
//   supabase functions deploy notify-order --project-ref <ref> --no-verify-jwt
//   # RESEND_API_KEY is already set for send-quote; reused here.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const LOGO = 'https://iksyoxumzctnwxeziiad.supabase.co/storage/v1/object/public/media/email-logo.png'
const NOVA_INBOX = 'contact@novagraphik.fr'
const FROM = 'Nova Graphik <onboarding@resend.dev>'

const esc = (s: unknown) =>
  String(s ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string))

interface OrderData {
  promotion_title: string
  promo_code: string
  offer_label: string
  customer_name: string
  customer_email: string
  customer_phone: string
  message: string
}

function shell(title: string, intro: string, inner: string, footer: string) {
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light only">
</head>
<body style="margin:0;padding:24px;background:#eef2f1;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e6ecec;border-radius:12px;overflow:hidden">
    <div style="background:#ffffff;padding:26px;text-align:center">
      <img src="${LOGO}" alt="Nova Graphik" width="190" style="display:block;margin:0 auto;background:#ffffff"/>
    </div>
    <div style="background:#022c3d;height:4px;font-size:0;line-height:0">&nbsp;</div>
    <div style="padding:28px;background:#ffffff">
      <h2 style="color:#022c3d;margin:0 0 4px;font-size:20px">${title}</h2>
      <p style="color:#6b7d83;margin:0 0 20px;font-size:13px">${intro}</p>
      ${inner}
    </div>
    <div style="background:#f1f5f4;padding:16px;text-align:center;color:#8aa1a4;font-size:11px">${footer}</div>
  </div>
</body></html>`
}

function codeBadge(code: string) {
  return `<div style="margin:18px 0;text-align:center">
    <span style="display:inline-block;background:#022c3d;color:#0cf25d;font-weight:bold;letter-spacing:1px;padding:12px 22px;border-radius:8px;font-size:18px;border:2px solid #0cf25d">${esc(code)}</span>
    <div style="color:#8aa1a4;font-size:11px;margin-top:6px">Code promo Nova Graphik</div>
  </div>`
}

function detailsTable(d: OrderData) {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:8px 0;color:#6b7d83;width:140px;vertical-align:top">${label}</td><td style="padding:8px 0;color:#0c1a1f">${value}</td></tr>`
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">
    ${row('Promotion', `<strong>${esc(d.promotion_title)}</strong>`)}
    ${d.offer_label ? row('Offre', esc(d.offer_label)) : ''}
    ${row('Client', `<strong>${esc(d.customer_name)}</strong>`)}
    ${row('E-mail', `<a href="mailto:${esc(d.customer_email)}" style="color:#02735e">${esc(d.customer_email)}</a>`)}
    ${d.customer_phone ? row('Téléphone', `<a href="tel:${esc(d.customer_phone)}" style="color:#02735e">${esc(d.customer_phone)}</a>`) : ''}
    ${d.message ? row('Message', `<span style="white-space:pre-line">${esc(d.message)}</span>`) : ''}
  </table>`
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS })

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })

  try {
    const b = await req.json()
    const d: OrderData = {
      promotion_title: String(b.promotion_title ?? '').trim(),
      promo_code: String(b.promo_code ?? '').trim(),
      offer_label: String(b.offer_label ?? '').trim(),
      customer_name: String(b.customer_name ?? '').trim(),
      customer_email: String(b.customer_email ?? '').trim(),
      customer_phone: String(b.customer_phone ?? '').trim(),
      message: String(b.message ?? '').trim(),
    }
    const merchantEmail = String(b.merchant_email ?? '').trim()
    if (!d.customer_name || !d.customer_email) return json({ error: 'Champs requis manquants.' }, 400)

    const key = Deno.env.get('RESEND_API_KEY')
    if (!key) return json({ error: 'RESEND_API_KEY manquant.' }, 500)

    const send = (to: string, subject: string, html: string, replyTo?: string) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: [to], subject, html, ...(replyTo ? { reply_to: replyTo } : {}) }),
      })

    const emails: Promise<Response>[] = []

    // 1) Nova — proof of conversion.
    emails.push(
      send(
        NOVA_INBOX,
        `Nouvelle commande avec code promo — ${d.promo_code}`,
        shell(
          'Nouvelle commande via un code promo Nova',
          'Reçue via le site novagraphik.fr',
          codeBadge(d.promo_code) + detailsTable(d),
          'Répondez à cet e-mail pour contacter le client.',
        ),
        d.customer_email,
      ),
    )

    // 2) Merchant concerned — receives the lead.
    if (merchantEmail) {
      emails.push(
        send(
          merchantEmail,
          `Nouvelle commande Nova Graphik — ${d.promo_code}`,
          shell(
            'Un client a commandé avec votre promotion',
            'Transmise par Nova Graphik',
            codeBadge(d.promo_code) + detailsTable(d),
            'Cette commande vous est transmise par Nova Graphik.',
          ),
          d.customer_email,
        ),
      )
    }

    // 3) Customer — confirmation with their code.
    emails.push(
      send(
        d.customer_email,
        `Votre commande est bien enregistrée — ${d.promotion_title}`,
        shell(
          `Merci ${esc(d.customer_name)} !`,
          'Votre demande a bien été transmise via Nova Graphik',
          `<p style="font-size:14px;color:#0c1a1f;margin:0 0 4px">Conservez votre code promo et présentez-le lors de votre commande :</p>${codeBadge(d.promo_code)}${detailsTable(d)}`,
          'Nova Graphik — communication visuelle.',
        ),
        NOVA_INBOX,
      ),
    )

    const results = await Promise.allSettled(emails)
    const sent = results.filter((r) => r.status === 'fulfilled' && (r.value as Response).ok).length
    return json({ ok: sent > 0, sent, total: results.length })
  } catch (e) {
    return json({ error: String(e) }, 500)
  }
})
