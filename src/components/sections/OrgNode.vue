<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { novaGrad } from '@/lib/gradients'
import type { TeamMember } from '@/lib/api'

defineOptions({ name: 'OrgNode' })
defineProps<{ node: TeamMember & { children: any[] }; idx?: number }>()
</script>

<template>
  <li
    class="relative list-none pt-6 px-3 text-center align-top
      before:content-[''] before:absolute before:top-0 before:right-1/2 before:w-1/2 before:h-6 before:border-t before:border-line
      after:content-[''] after:absolute after:top-0 after:left-1/2 after:w-1/2 after:h-6 after:border-t after:border-line
      only:before:hidden only:after:hidden only:pt-0
      first:before:border-0 last:after:border-0
      last:before:border-r last:before:border-line last:before:rounded-tr-md
      first:after:rounded-tl-md"
  >
    <RouterLink :to="`/equipe/${node.slug}`" class="inline-flex flex-col items-center w-[150px] no-underline group">
      <div
        class="w-[84px] h-[84px] rounded-full overflow-hidden ring-2 ring-line group-hover:ring-nova-lime transition-all duration-nova"
        :style="!node.photo ? { background: novaGrad(idx || 0) } : {}"
      >
        <img v-if="node.photo" :src="node.photo" :alt="node.name" class="w-full h-full object-cover" />
      </div>
      <div class="font-display text-[17px] font-semibold text-fg-1 mt-3 group-hover:text-nova-teal transition-colors duration-nova">
        {{ node.name }}
      </div>
      <div class="font-glyphic text-[10px] tracking-[0.18em] uppercase text-nova-teal">{{ node.role }}</div>
    </RouterLink>
    <ul
      v-if="node.children && node.children.length"
      class="flex justify-center relative
        before:content-[''] before:absolute before:top-0 before:left-1/2 before:border-l before:border-line before:h-6 before:w-0"
    >
      <OrgNode v-for="(c, i) in node.children" :key="c.id" :node="c" :idx="i" />
    </ul>
  </li>
</template>
