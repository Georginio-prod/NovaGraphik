// Public site configuration. Used to build absolute URLs (e.g. the target a
// promotion QR code points to) so a scan lands on the live site.
export const SITE_URL = 'https://novagraphikvisu.com'

/** Absolute URL of a promotion's detail page on the live site. */
export function promoUrl(slug: string): string {
  return slug ? `${SITE_URL}/promotions/${slug}` : SITE_URL
}
