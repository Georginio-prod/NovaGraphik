import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { useHead, useSeoMeta } from '@unhead/vue'
import { useRoute } from 'vue-router'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  absoluteUrl,
  pageTitle,
} from '@/lib/seo'

export interface SeoInput {
  /** Page title without the brand suffix (e.g. "Portfolio"). Omit for home. */
  title?: MaybeRefOrGetter<string | undefined>
  /** Meta description (≤ 160 chars). Falls back to the brand default. */
  description?: MaybeRefOrGetter<string | undefined>
  /** Absolute image URL for social cards. Falls back to the brand OG image. */
  image?: MaybeRefOrGetter<string | undefined>
  /** Canonical path; defaults to the current route path. */
  path?: MaybeRefOrGetter<string | undefined>
  /** "article" for blog posts, otherwise "website". */
  type?: 'website' | 'article'
  /** Set true to keep a page out of the index (e.g. admin, thin pages). */
  noindex?: MaybeRefOrGetter<boolean | undefined>
}

/**
 * Set per-page SEO tags (title, description, canonical, Open Graph, Twitter).
 * Reactive: pass refs/getters and the head updates as async content loads.
 */
export function useSeo(input: SeoInput = {}): void {
  const route = useRoute()

  const title = computed(() => pageTitle(toValue(input.title)))
  const description = computed(() => toValue(input.description) || DEFAULT_DESCRIPTION)
  const image = computed(() => toValue(input.image) || DEFAULT_OG_IMAGE)
  const canonical = computed(() => absoluteUrl(toValue(input.path) ?? route.path))
  const robots = computed(() => (toValue(input.noindex) ? 'noindex, nofollow' : 'index, follow'))

  useHead({
    title,
    link: [{ rel: 'canonical', href: canonical }],
    meta: [{ name: 'robots', content: robots }],
  })

  useSeoMeta({
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: input.type ?? 'website',
    ogUrl: canonical,
    ogImage: image,
    ogSiteName: SITE_NAME,
    ogLocale: 'fr_FR',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: image,
  })
}
