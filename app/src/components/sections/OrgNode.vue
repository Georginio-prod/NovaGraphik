<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { novaGrad } from '@/lib/gradients'
import type { TeamMember } from '@/lib/api'

// Recursive org-chart node. Connectors are REAL elements (not CSS pseudo-
// elements) so GSAP can "draw" them: vertical stubs scale on Y, horizontal
// bars scale on X. `data-org` + `data-depth` let the parent chart sequence the
// reveal by level. Works for any number of children / depth from the dashboard.
defineOptions({ name: 'OrgNode' })
withDefaults(defineProps<{ node: TeamMember & { children: any[] }; idx?: number; depth?: number }>(), {
  idx: 0,
  depth: 0,
})

const LINE = 'bg-fg-1' // diagram-style ink line, adapts to light/dark
</script>

<template>
  <div class="flex flex-col items-center">
    <!-- Root crown: a short stub rising from the top node, like the diagram -->
    <div
      v-if="depth === 0"
      data-org="line"
      :data-depth="0"
      class="org-vline h-6 w-[2px] origin-bottom"
      :class="LINE"
    ></div>

    <!-- Member card -->
    <div data-org="card" :data-depth="depth" class="org-card">
      <RouterLink
        :to="`/equipe/${node.slug}`"
        class="group flex w-[150px] flex-col items-center no-underline"
      >
        <div
          class="h-[78px] w-[78px] overflow-hidden rounded-full ring-2 ring-line transition-all duration-nova ease-nova group-hover:-translate-y-0.5 group-hover:ring-nova-lime group-hover:shadow-nova-md"
          :style="!node.photo ? { background: novaGrad(idx) } : {}"
        >
          <img v-if="node.photo" :src="node.photo" :alt="node.name" class="h-full w-full object-cover" />
        </div>
        <div class="mt-2.5 font-display text-[16px] font-semibold text-fg-1 transition-colors duration-nova group-hover:text-nova-teal">
          {{ node.name }}
        </div>
        <div class="mt-0.5 font-glyphic text-[9.5px] uppercase tracking-[0.18em] text-nova-teal">{{ node.role }}</div>
      </RouterLink>
    </div>

    <!-- Children: vertical stub from this node down to the horizontal bar -->
    <div v-if="node.children && node.children.length" class="flex flex-col items-center">
      <div data-org="line" :data-depth="depth + 1" class="org-vline h-6 w-[2px] origin-top" :class="LINE"></div>
      <ul class="flex list-none items-start justify-center p-0">
        <li
          v-for="(c, i) in node.children"
          :key="c.id"
          class="relative flex flex-col items-center px-3 tab:px-5"
        >
          <!-- Horizontal bar segments: left/right halves join adjacent siblings -->
          <div
            v-if="i !== 0"
            data-org="bar"
            :data-depth="depth + 1"
            class="org-hbar absolute left-0 top-0 h-[2px] w-1/2 origin-center"
            :class="LINE"
          ></div>
          <div
            v-if="i !== node.children.length - 1"
            data-org="bar"
            :data-depth="depth + 1"
            class="org-hbar absolute right-0 top-0 h-[2px] w-1/2 origin-center"
            :class="LINE"
          ></div>
          <!-- Vertical stub from the bar down into the child card -->
          <div data-org="line" :data-depth="depth + 1" class="org-vline h-6 w-[2px] origin-top" :class="LINE"></div>
          <OrgNode :node="c" :idx="i" :depth="depth + 1" />
        </li>
      </ul>
    </div>
  </div>
</template>
