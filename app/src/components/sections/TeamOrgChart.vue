<script setup lang="ts">
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { novaGrad } from '@/lib/gradients'
import { gsap, ScrollTrigger, NOVA, prefersReducedMotion } from '@/lib/gsap'
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

// ─── GSAP draw-in: reveal the tree level by level (lines, then cards) ─────────
const chartRef = ref<HTMLElement | null>(null)
let tl: gsap.core.Timeline | null = null

function kill() {
  tl?.scrollTrigger?.kill()
  tl?.kill()
  tl = null
}

function build() {
  kill()
  const root = chartRef.value
  if (prefersReducedMotion || !root) return

  const depths = [...root.querySelectorAll<HTMLElement>('[data-depth]')].map(
    (e) => Number(e.dataset.depth),
  )
  if (!depths.length) return
  const maxDepth = Math.max(...depths)

  tl = gsap.timeline({
    scrollTrigger: { trigger: root, start: 'top 82%', once: true },
    defaults: { ease: NOVA.ease },
  })

  const at = (d: number, sel: string) =>
    root.querySelectorAll(`${sel}[data-depth="${d}"]`)

  for (let d = 0; d <= maxDepth; d++) {
    const vlines = at(d, '.org-vline')
    const bars = at(d, '.org-hbar')
    const cards = at(d, '.org-card')

    if (vlines.length) tl.from(vlines, { scaleY: 0, duration: 0.22, stagger: 0.04 }, d === 0 ? 0 : '-=0.04')
    if (bars.length) tl.from(bars, { scaleX: 0, duration: 0.28, stagger: 0.04 }, '<')
    if (cards.length)
      tl.from(
        cards,
        { autoAlpha: 0, scale: 0.84, y: 12, duration: 0.34, stagger: 0.06 },
        vlines.length || bars.length ? '-=0.06' : 0,
      )
  }

  ScrollTrigger.refresh()
}

watch(
  () => props.members,
  () => nextTick(build),
  { deep: true, immediate: true },
)

onBeforeUnmount(kill)
</script>

<template>
  <!-- flat team → clean grid -->
  <div v-if="!hasHierarchy" class="grid grid-cols-1 tab:grid-cols-3 gap-6 mt-12">
    <RouterLink
      v-for="(m, i) in members"
      :key="m.id"
      :to="`/equipe/${m.slug}`"
      v-reveal:scale="i * 90"
      class="text-center no-underline group"
    >
      <div
        class="aspect-square w-full max-w-[260px] mx-auto rounded-lg overflow-hidden transition-transform duration-nova ease-nova group-hover:-translate-y-1"
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

  <!-- hierarchy → org chart (diagram-style connectors, GSAP draw-in) -->
  <div v-else ref="chartRef" class="mt-12 overflow-x-auto pb-2 pt-2">
    <div class="flex min-w-max justify-center">
      <OrgNode v-for="(n, i) in tree" :key="n.id" :node="n" :idx="i" :depth="0" />
    </div>
  </div>
</template>
