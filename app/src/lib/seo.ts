// Central SEO configuration & helpers.
// ----------------------------------------------------------------------------
// The app is a Vue SPA, so per-page <title>/<meta> are managed at runtime with
// unhead (see composables/useSeo). These constants provide the brand defaults
// and absolute-URL helpers shared by every page, the sitemap generator and the
// JSON-LD structured data.
import { SITE_URL } from '@/lib/site'

export { SITE_URL }

/** Brand name used in titles and structured data. */
export const SITE_NAME = 'Nova Graphik Visu'

/** Suffix appended to page titles, e.g. "Portfolio | Nova Graphik Visu". */
export const TITLE_SUFFIX = SITE_NAME

/** Default social-share / fallback description (≤ 160 chars). */
export const DEFAULT_DESCRIPTION =
  'Nova Graphik Visu — agence de communication visuelle : identité de marque, ' +
  'supports imprimés, motion design, 3D, photo et sites web sur mesure.'

/** Default Open Graph image (place a 1200×630 file at public/og-cover.jpg). */
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-cover.jpg`

/** Default keywords (low SEO weight today, harmless to include). */
export const DEFAULT_KEYWORDS =
  'communication visuelle, design graphique, identité de marque, logo, ' +
  'motion design, 3D, photographie, site web, Nova Graphik'

/** Build an absolute canonical URL from a route path (e.g. "/portfolios"). */
export function absoluteUrl(path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${clean === '/' ? '' : clean}`
}

/** Compose a full <title>: "Page | Nova Graphik Visu" (home uses the brand). */
export function pageTitle(title?: string): string {
  if (!title) return `${SITE_NAME} — Communication visuelle & design`
  return `${title} | ${TITLE_SUFFIX}`
}

/** Organization JSON-LD, injected once on the home page. */
export function organizationJsonLd(opts: {
  email?: string
  phone?: string
  location?: string
  sameAs?: string[]
} = {}): Record<string, unknown> {
  const sameAs = (opts.sameAs ?? []).filter(Boolean)
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    description: DEFAULT_DESCRIPTION,
    ...(opts.email ? { email: opts.email } : {}),
    ...(opts.phone ? { telephone: opts.phone } : {}),
    ...(opts.location ? { address: { '@type': 'PostalAddress', addressLocality: opts.location } } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  }
}
