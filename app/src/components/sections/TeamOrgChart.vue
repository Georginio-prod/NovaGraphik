<script setup lang="ts">
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { novaGrad } from '@/lib/gradients'
import { gsap, ScrollTrigger, NOVA, prefersReducedMotion } from '@/lib/gsap'
import type { TeamMember } from '@/lib/api'

const props = defineProps<{ members: TeamMember[] }>()

type Node = TeamMember & { children: Node[]; x: number; y: number; depth: number; ci: number }

const hasHierarchy = computed(() => props.members.some((m) => m.parent_id != null))

// ─── Geometry ─────────────────────────────────────────────────────────────────
const R = 36 // circle radius
const COL = 210 // horizontal slot per node
const ROW = 240 // vertical pitch between levels
const PAD_TOP = 54 // top padding (room for the first circle)
const LABEL_H = 72 // reserved height for name + role under each circle
const CARD_W = 190 // label box width

// Pyramid lattice: every level is an evenly-spaced, centred row; consecutive
// levels are joined by ONE continuous horizontal bus. Connectors attach to the
// BOTTOM of a card (below the label) and the TOP of the next circle, so a line
// never crosses any name/role text. Fully data-driven (depth from parent_id).
const layout = computed(() => {
  const map = new Map<number, Node>()
  props.members.forEach((m, i) =>
    map.set(m.id, { ...m, children: [], x: 0, y: 0, depth: 0, ci: i }),
  )
  const roots: Node[] = []
  map.forEach((n) => {
    if (n.parent_id != null && map.has(n.parent_id)) map.get(n.parent_id)!.children.push(n)
    else roots.push(n)
  })

  // DFS → stable left-to-right order, grouped per depth level.
  const levels: Node[][] = []
  const walk = (n: Node, depth: number) => {
    n.depth = depth
    ;(levels[depth] ||= []).push(n)
    n.children.forEach((c) => walk(c, depth + 1))
  }
  roots.forEach((r) => walk(r, 0))

  const maxCount = Math.max(1, ...levels.map((l) => l.length))
  const totalWidth = maxCount * COL

  levels.forEach((lvl, d) => {
    const n = lvl.length
    lvl.forEach((node, i) => {
      node.x = (totalWidth * (i + 0.5)) / n
      node.y = d * ROW + PAD_TOP
    })
  })

  const nodes = levels.flat()

  // One continuous bus per level transition.
  const paths: { d: string; depth: number; key: string }[] = []
  for (let d = 0; d < levels.length - 1; d++) {
    const up = levels[d]
    const lo = levels[d + 1]
    const upBottom = up[0].y + R + LABEL_H // below the upper labels
    const loTop = lo[0].y - R // above the lower circles
    const busY = (upBottom + loTop) / 2
    const xs = [...up.map((u) => u.x), ...lo.map((l) => l.x)]
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)

    let str = ''
    up.forEach((u) => (str += `M ${u.x} ${upBottom} L ${u.x} ${busY} `))
    str += `M ${minX} ${busY} L ${maxX} ${busY} ` // continuous horizontal bus
    lo.forEach((l) => (str += `M ${l.x} ${busY} L ${l.x} ${loTop} `))
    paths.push({ d: str, depth: d + 1, key: `bus-${d}` })
  }

  const maxDepth = Math.max(0, levels.length - 1)
  return {
    nodes,
    paths,
    width: totalWidth,
    height: maxDepth * ROW + PAD_TOP + R + LABEL_H + 24,
  }
})

// ─── GSAP draw-in, replayed every time the chart scrolls into view ────────────
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

  const nodeEls = root.querySelectorAll<HTMLElement>('.org-node')
  const pathEls = root.querySelectorAll<SVGPathElement>('.org-path')
  if (!nodeEls.length) return

  gsap.set(nodeEls, { autoAlpha: 0, scale: 0.8, transformOrigin: `50% ${R}px` })
  pathEls.forEach((p) => {
    const len = p.getTotalLength()
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
  })

  const maxDepth = Math.max(...[...nodeEls].map((e) => Number(e.dataset.depth)))

  tl = gsap.timeline({
    scrollTrigger: { trigger: root, start: 'top 80%', toggleActions: 'play none none reverse' },
    defaults: { ease: NOVA.ease },
  })

  for (let d = 0; d <= maxDepth; d++) {
    const dn = root.querySelectorAll(`.org-node[data-depth="${d}"]`)
    const dp = root.querySelectorAll(`.org-path[data-depth="${d}"]`)
    if (dp.length)
      tl.to(dp, { strokeDashoffset: 0, duration: 0.45, stagger: 0.08 }, d === 0 ? 0 : '>-0.1')
    if (dn.length)
      tl.to(dn, { autoAlpha: 1, scale: 1, duration: 0.42, stagger: 0.08 }, dp.length ? '-=0.2' : 0)
  }

  ScrollTrigger.refresh()
}

watch(() => props.members, () => nextTick(build), { deep: true, immediate: true })
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

  <!-- hierarchy → pyramid lattice with continuous SVG bus + GSAP draw-in -->
  <div v-else ref="chartRef" class="mt-12 overflow-x-auto pb-4">
    <div class="relative mx-auto" :style="{ width: layout.width + 'px', height: layout.height + 'px' }">
      <svg
        class="absolute inset-0 pointer-events-none overflow-visible text-fg-1"
        :width="layout.width"
        :height="layout.height"
        fill="none"
      >
        <path
          v-for="p in layout.paths"
          :key="p.key"
          :d="p.d"
          :data-depth="p.depth"
          class="org-path stroke-current"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <div
        v-for="n in layout.nodes"
        :key="n.id"
        :data-depth="n.depth"
        class="org-node absolute"
        :style="{ left: n.x - CARD_W / 2 + 'px', top: n.y - R + 'px', width: CARD_W + 'px' }"
      >
        <RouterLink :to="`/equipe/${n.slug}`" class="group flex flex-col items-center no-underline">
          <div
            class="overflow-hidden rounded-full ring-2 ring-line transition-all duration-nova ease-nova group-hover:-translate-y-0.5 group-hover:ring-nova-lime group-hover:shadow-nova-md"
            :style="[{ width: R * 2 + 'px', height: R * 2 + 'px' }, !n.photo ? { background: novaGrad(n.ci) } : {}]"
          >
            <img v-if="n.photo" :src="n.photo" :alt="n.name" class="h-full w-full object-cover" />
          </div>
          <div class="mt-2.5 text-center font-display text-[16px] font-semibold leading-tight text-fg-1 transition-colors duration-nova group-hover:text-nova-teal">
            {{ n.name }}
          </div>
          <div class="mt-1 text-center font-glyphic text-[9.5px] uppercase leading-tight tracking-[0.16em] text-nova-teal">
            {{ n.role }}
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
