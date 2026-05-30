<script setup lang="ts">
import { computed } from 'vue'
import type { TeamMember } from '@/lib/api'
import TeamDecisionTree from './TeamDecisionTree.vue'

const props = defineProps<{ members: TeamMember[] }>()

// Build a name → slug table so result cards link to each member's page.
const slugMap = computed<Record<string, string>>(() =>
  Object.fromEntries(props.members.map((m) => [m.name, m.slug])),
)

// "Quelle équipe vous faut-il ?" — only configurations whose members are
// currently on the team are listed.
const tree = {
  type: 'question' as const,
  n: 1,
  text: "Avez-vous besoin d'un Graphiste Designer ?",
  yes: {
    type: 'question' as const,
    n: 2,
    text: "Avez-vous besoin d'un Monteur Vidéo / YouTube ?",
    yes: {
      type: 'question' as const,
      n: 3,
      text: "Avez-vous aussi besoin d'un Web Designer ?",
      yes: { type: 'result' as const, label: 'TEAM COMPLÈTE', members: ['AMEGNAGLO K.S', 'TAMEGNON K.K', 'GEORGE'] },
      no: { type: 'result' as const, label: 'DUO CRÉATIF', members: ['AMEGNAGLO K.S', 'TAMEGNON K.K'] },
    },
    no: {
      type: 'question' as const,
      n: 4,
      text: "Avez-vous besoin d'un Web Designer ?",
      yes: { type: 'result' as const, label: 'DUO DESIGN', members: ['AMEGNAGLO K.S', 'GEORGE'] },
      no: { type: 'result' as const, label: 'GRAPHISTE SEUL', members: ['AMEGNAGLO K.S'] },
    },
  },
  no: {
    type: 'question' as const,
    n: 5,
    text: "Avez-vous besoin d'un Monteur Vidéo / YouTube ?",
    yes: {
      type: 'question' as const,
      n: 6,
      text: "Avez-vous besoin d'un Web Designer ?",
      yes: { type: 'result' as const, label: 'DUO TECH CRÉATIF', members: ['TAMEGNON K.K', 'GEORGE'] },
      no: { type: 'result' as const, label: 'MONTEUR VIDÉO SEUL', members: ['TAMEGNON K.K'] },
    },
    no: { type: 'result' as const, label: 'WEB DESIGNER SEUL', members: ['GEORGE'] },
  },
}
</script>

<template>
  <div class="overflow-x-auto pb-4">
    <ul class="flex justify-center min-w-max">
      <TeamDecisionTree :node="tree" :slug-map="slugMap" />
    </ul>
  </div>
</template>
