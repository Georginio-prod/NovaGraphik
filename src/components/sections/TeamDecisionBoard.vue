<script setup lang="ts">
import TeamDecisionTree from './TeamDecisionTree.vue'

// "Quelle équipe vous faut-il ?" — decision tree matching the brief's reference.
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
      yes: { type: 'result' as const, label: 'TEAM COMPLÈTE', members: ['AMENGAGLO K.S', 'TAMEGNON K.K', 'GEORGE'] },
      no: { type: 'result' as const, label: 'DUO CRÉATIF', members: ['AMENGAGLO K.S', 'TAMEGNON K.K'] },
    },
    no: {
      type: 'question' as const,
      n: 4,
      text: "Avez-vous besoin d'un Web Designer ?",
      yes: { type: 'result' as const, label: 'DUO DESIGN', members: ['AMENGAGLO K.S', 'GEORGE'] },
      no: { type: 'result' as const, label: 'GRAPHISTE SEUL', members: ['AMENGAGLO K.S'] },
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
    no: {
      type: 'question' as const,
      n: 7,
      text: "Avez-vous besoin d'un Web Designer ?",
      yes: { type: 'result' as const, label: 'WEB DESIGNER SEUL', members: ['GEORGE'] },
      no: { type: 'result' as const, label: 'AUCUN BESOIN SPÉCIFIQUE', members: [], hint: 'Réévaluez vos besoins', muted: true },
    },
  },
}
</script>

<template>
  <div class="overflow-x-auto pb-4">
    <ul class="flex justify-center min-w-max">
      <TeamDecisionTree :node="tree" />
    </ul>
  </div>
</template>
