import type { PromoCode } from '@/lib/api'

// Promo codes are branded with a NOVA- prefix so the merchant and the customer
// both see the offer comes from Nova Graphik. Generated from the offer label (or
// the promotion title) + a short random suffix to stay unique and human-readable.
export function generatePromoCode(seed = ''): string {
  const base = seed
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .slice(0, 10)
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let suffix = ''
  for (let i = 0; i < 4; i++) suffix += chars[Math.floor(Math.random() * chars.length)]
  return `NOVA-${base ? base + '-' : ''}${suffix}`
}

export function emptyPromoCode(seed = ''): PromoCode {
  return { code: generatePromoCode(seed), label: '', discount: '', description: '' }
}
