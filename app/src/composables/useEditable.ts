import { ref } from 'vue'
import { api } from '@/lib/api'
import { readCache, writeCache } from '@/lib/cache'
import type {
  NavItem,
  Service,
  Article,
  Partner,
  Testimonial,
  PricingItem,
  PricingFormula,
  Promotion,
} from '@/lib/api'

/**
 * Generic factory: returns a singleton composable that loads `items` from a
 * public endpoint and caches them. All editable public sections (nav, services,
 * blogs, partners, etc.) consume one of these in their components.
 */
function makeLoader<T>(path: string) {
  // Hydrate instantly from the last cached payload (stale-while-revalidate).
  const items = ref<T[]>(readCache<T[]>(path) ?? [])
  const loaded = ref(false)
  async function load(force = false) {
    if (loaded.value && !force) return items.value
    try {
      const data = await api.get<{ items: T[] }>(path)
      items.value = data.items || []
      writeCache(path, items.value)
    } catch {
      // keep previous
    } finally {
      loaded.value = true
    }
    return items.value
  }
  return () => ({ items, loaded, load })
}

export const useNav = makeLoader<NavItem>('/nav')
export const useServices = makeLoader<Service>('/services')
export const useArticles = makeLoader<Article>('/articles')
export const usePartners = makeLoader<Partner>('/partners')
export const useTestimonials = makeLoader<Testimonial>('/testimonials')
export const usePricingItems = makeLoader<PricingItem>('/pricing-items')
export const usePricingFormulas = makeLoader<PricingFormula>('/pricing-formulas')
export const usePromotions = makeLoader<Promotion>('/promotions')
