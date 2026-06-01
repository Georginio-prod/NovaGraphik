import { ref } from 'vue'
import { api } from '@/lib/api'

// Shared singleton of public site settings (contact info, social links…).
const settings = ref<Record<string, string>>({})
let loaded = false

export function useSettings() {
  async function load(force = false) {
    if (loaded && !force) return settings.value
    try {
      const data = await api.get<{ settings: Record<string, string> }>('/settings')
      settings.value = data.settings || {}
    } catch {
      // keep defaults
    }
    loaded = true
    return settings.value
  }

  const get = (key: string, fallback = '') => settings.value[key] || fallback

  return { settings, load, get }
}
