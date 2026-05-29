import { ref, computed } from 'vue'
import { api, type Section } from '@/lib/api'

export const BUILT_IN_SECTION_TYPES = ['Hero', 'Services', 'Portfolios', 'Équipe'] as const
export type BuiltInSectionType = (typeof BUILT_IN_SECTION_TYPES)[number]

const BUILT_IN_SET = new Set<string>(BUILT_IN_SECTION_TYPES)

export function isBuiltInSectionType(type: string): type is BuiltInSectionType {
  return BUILT_IN_SET.has(type)
}

// Loads the published (visible) sections for a page so the public site reflects
// dashboard edits. Falls back gracefully to design defaults when a section is
// hidden or the API is unreachable.
export function useSiteContent(page = 'home') {
  const sections = ref<Section[]>([])
  const map = ref<Record<string, { title: string; body: string }>>({})
  const loaded = ref(false)

  async function load() {
    try {
      const data = await api.get<{ sections: Section[] }>(`/sections?page=${page}`)
      sections.value = data.sections
      const next: Record<string, { title: string; body: string }> = {}
      for (const s of data.sections) next[s.type] = { title: s.title, body: s.body }
      map.value = next
    } catch {
      // keep defaults
    } finally {
      loaded.value = true
    }
  }

  const customSections = computed(() =>
    sections.value.filter((s) => !isBuiltInSectionType(s.type)),
  )

  const has = (type: string) => !loaded.value || !!map.value[type]
  const title = (type: string, fallback: string) => map.value[type]?.title ?? fallback
  const body = (type: string, fallback: string) => map.value[type]?.body ?? fallback

  return { loaded, sections, customSections, has, title, body, load }
}
