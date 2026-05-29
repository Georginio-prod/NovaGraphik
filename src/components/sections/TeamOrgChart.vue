<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { novaGrad } from '@/lib/gradients'
import type { TeamMember } from '@/lib/api'
import OrgNode from './OrgNode.vue'

const props = defineProps<{ members: TeamMember[] }>()

const hasHierarchy = computed(() => props.members.some((m) => m.parent_id != null))

const tree = computed(() => {
  const map = new Map<number, TeamMember & { children: any[] }>()
  props.members.forEach((m) => map.set(m.id, { ...m, children: [] }))
  const roots: (TeamMember & { children: any[] })[] = []
  map.forEach((n) => {
    if (n.parent_id != null && map.has(n.parent_id)) map.get(n.parent_id)!.children.push(n)
    else roots.push(n)
  })
  return roots
})
</script>

<template>
  <!-- flat team → clean grid -->
  <div v-if="!hasHierarchy" class="grid grid-cols-1 tab:grid-cols-3 gap-6 mt-12">
    <RouterLink
      v-for="(m, i) in members"
      :key="m.id"
      :to="`/equipe/${m.slug}`"
      v-reveal="i * 90"
      class="text-center no-underline group"
    >
      <div
        class="aspect-square w-full max-w-[260px] mx-auto rounded-lg overflow-hidden"
        :style="!m.photo ? { background: novaGrad(i) } : {}"
      >
        <img v-if="m.photo" :src="m.photo" :alt="m.name" class="w-full h-full object-cover" />
      </div>
      <h3 class="font-display text-[22px] font-semibold mt-[18px] mb-1 text-fg-1 group-hover:text-nova-teal transition-colors duration-nova">
        {{ m.name }}
      </h3>
      <div class="font-glyphic text-[11px] tracking-[0.22em] uppercase text-nova-teal">{{ m.role }}</div>
    </RouterLink>
  </div>

  <!-- hierarchy → org chart -->
  <div v-else class="overflow-x-auto mt-12 pb-2">
    <ul class="flex justify-center min-w-max">
      <OrgNode v-for="(n, i) in tree" :key="n.id" :node="n" :idx="i" />
    </ul>
  </div>
</template>
