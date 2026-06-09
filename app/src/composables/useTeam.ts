import { ref } from 'vue'
import { api, type TeamMember } from '@/lib/api'
import { readCache, writeCache } from '@/lib/cache'

export function useTeam() {
  const members = ref<TeamMember[]>(readCache<TeamMember[]>('team') ?? [])
  const loaded = ref(false)
  async function load() {
    try {
      const data = await api.get<{ members: TeamMember[] }>('/team')
      members.value = data.members
      writeCache('team', data.members)
    } catch {
      // keep empty
    } finally {
      loaded.value = true
    }
  }
  return { members, loaded, load }
}
