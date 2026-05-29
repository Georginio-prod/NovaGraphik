import { ref } from 'vue'
import { api, type Section } from '@/lib/api'

// Loads the published (visible) sections for a page so the public site reflects
// dashboard edits. Falls back gracefully to design defaults when a section is
// hidden or the API is unreachable.
export function useSiteContent(page = 'home') {
  const map = ref<Record<string, { title: string; body: string }>>({})
  const loaded = ref(false)

  async function load() {
    try {
      const data = await api.get<{ sections: Section[] }>(`/sections?page=${page}`)
      const next: Record<string, { title: string; body: string }> = {}
      for (const s of data.sections) next[s.type] = { title: s.title, body: s.body }
      map.value = next
    } catch {
      // keep defaults
    } finally {
      loaded.value = true
    }
  }

  const has = (type: string) => !loaded.value || !!map.value[type]
  const title = (type: string, fallback: string) => map.value[type]?.title ?? fallback
  const body = (type: string, fallback: string) => map.value[type]?.body ?? fallback

  return { loaded, has, title, body, load }
}
