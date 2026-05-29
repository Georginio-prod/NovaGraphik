<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import NEyebrow from '@/components/base/NEyebrow.vue'
import NIcon from '@/components/base/NIcon.vue'

const route = useRoute()
const title = computed(() => (route.meta.title as string) || 'Section')
</script>

<template>
  <NEyebrow>Tableau de bord</NEyebrow>
  <h1 class="font-display text-[32px] font-semibold mt-1.5 mb-1 text-fg-1">{{ title }}</h1>
  <div class="mt-8 max-w-[480px] bg-nova-surface border border-line rounded-lg p-8 text-center">
    <div class="w-14 h-14 rounded-full bg-nova-fog grid place-items-center text-nova-teal mx-auto mb-4">
      <NIcon name="sparkles" :size="24" />
    </div>
    <p class="text-fg-2 m-0">La gestion de « {{ title }} » arrive prochainement.</p>
  </div>
</template>
