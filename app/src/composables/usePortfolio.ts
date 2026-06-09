import { ref } from 'vue'
import { api, type PortfolioItem } from '@/lib/api'
import { readCache, writeCache } from '@/lib/cache'

export function usePortfolio() {
  const items = ref<PortfolioItem[]>(readCache<PortfolioItem[]>('portfolio:items') ?? [])
  const categories = ref<string[]>(readCache<string[]>('portfolio:categories') ?? [])
  const loaded = ref(false)
  async function load() {
    try {
      const d = await api.get<{ items: PortfolioItem[]; categories: string[] }>('/portfolio')
      items.value = d.items
      categories.value = d.categories
      writeCache('portfolio:items', d.items)
      writeCache('portfolio:categories', d.categories)
    } catch {
      // keep empty
    } finally {
      loaded.value = true
    }
  }
  return { items, categories, loaded, load }
}
