<script setup lang="ts">
import { RouterLink } from 'vue-router'
import NIcon from '@/components/base/NIcon.vue'

defineOptions({ name: 'TeamDecisionTree' })

type Result = { type: 'result'; label: string; members: string[]; hint?: string; muted?: boolean }
type Question = { type: 'question'; n: number; text: string; yes: Node; no: Node }
type Node = Question | Result

defineProps<{
  node: Node
  branch?: 'yes' | 'no' | null
  /** name → slug lookup so result names can link to /equipe/:slug */
  slugMap?: Record<string, string>
}>()
</script>

<template>
  <li
    class="relative list-none pt-12 px-3 text-center align-top
      before:content-[''] before:absolute before:top-0 before:right-1/2 before:w-1/2 before:h-12 before:border-t before:border-line
      after:content-[''] after:absolute after:top-0 after:left-1/2 after:w-1/2 after:h-12 after:border-t after:border-line
      only:before:hidden only:after:hidden only:pt-0
      first:before:border-0 last:after:border-0
      last:before:border-r last:before:border-line
      first:after:border-r first:after:border-line"
  >
    <!-- Yes/No chip on the vertical connector -->
    <span
      v-if="branch"
      class="absolute left-1/2 -translate-x-1/2 top-3 px-3 py-1 rounded-md text-[10px] font-semibold tracking-wider uppercase whitespace-nowrap"
      :class="branch === 'yes' ? 'bg-nova-green text-white' : 'bg-nova-lime-soft text-nova-navy-900'"
    >
      {{ branch === 'yes' ? 'Oui' : 'Non' }}
    </span>

    <!-- Card -->
    <div v-if="node.type === 'question'" class="inline-block relative">
      <span
        class="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-nova-navy-900 text-white text-[13px] font-semibold grid place-items-center shadow-nova-sm z-10"
      >{{ node.n }}</span>
      <div class="bg-nova-surface border border-line rounded-md px-5 py-4 max-w-[240px] text-[13px] text-fg-1 leading-snug shadow-nova-xs">
        {{ node.text }}
      </div>
    </div>

    <div
      v-else
      class="inline-flex flex-col items-center rounded-md px-5 py-4 min-w-[160px] gap-1.5"
      :class="
        node.muted
          ? 'bg-nova-fog text-fg-2 border border-line'
          : 'bg-gradient-to-br from-nova-navy via-nova-teal-deep to-nova-green text-white shadow-nova-sm'
      "
    >
      <NIcon :name="node.members.length > 1 ? 'users' : 'user'" :size="26" />
      <div class="font-semibold text-[11.5px] tracking-wider uppercase mt-1">{{ node.label }}</div>

      <!-- Member names: clickable when the slug exists -->
      <template v-for="m in node.members" :key="m">
        <RouterLink
          v-if="slugMap && slugMap[m]"
          :to="`/equipe/${slugMap[m]}`"
          class="font-glyphic text-[9.5px] tracking-[0.14em] uppercase no-underline transition-colors duration-nova text-white/85 hover:text-nova-lime"
        >{{ m }}</RouterLink>
        <span
          v-else
          class="font-glyphic text-[9.5px] tracking-[0.14em] uppercase"
          :class="node.muted ? 'text-fg-3' : 'text-white/85'"
        >{{ m }}</span>
      </template>

      <div v-if="node.hint" class="text-[9.5px] tracking-wider uppercase mt-1" :class="node.muted ? 'text-fg-3' : 'text-white/70'">
        {{ node.hint }}
      </div>
    </div>

    <!-- Children -->
    <ul v-if="node.type === 'question'" class="flex justify-center relative mt-4">
      <TeamDecisionTree :node="node.yes" branch="yes" :slug-map="slugMap" />
      <TeamDecisionTree :node="node.no" branch="no" :slug-map="slugMap" />
    </ul>
  </li>
</template>
