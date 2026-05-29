import { ref } from 'vue'
import { api, type PortfolioItem } from '@/lib/api'

export function usePortfolio() {
  const items = ref<PortfolioItem[]>([])
  const categories = ref<string[]>([])
  const loaded = ref(false)
  async function load() {
    try {
      const d = await api.get<{ items: PortfolioItem[]; categories: string[] }>('/portfolio')
      items.value = d.items
      categories.value = d.categories
    } catch {
      // keep empty
    } finally {
      loaded.value = true
    }
  }
  return { items, categories, loaded, load }
}
