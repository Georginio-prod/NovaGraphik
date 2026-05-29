import { ref } from 'vue'
import { api, type TeamMember } from '@/lib/api'

export function useTeam() {
  const members = ref<TeamMember[]>([])
  const loaded = ref(false)
  async function load() {
    try {
      const data = await api.get<{ members: TeamMember[] }>('/team')
      members.value = data.members
    } catch {
      // keep empty
    } finally {
      loaded.value = true
    }
  }
  return { members, loaded, load }
}
