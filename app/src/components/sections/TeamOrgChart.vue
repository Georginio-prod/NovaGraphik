<script setup lang="ts">
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import { novaGrad } from '@/lib/gradients'
import { gsap, ScrollTrigger, NOVA, prefersReducedMotion } from '@/lib/gsap'
import type { TeamMember } from '@/lib/api'

const props = defineProps<{ members: TeamMember[] }>()

type Node = TeamMember & { children: Node[]; x: number; y: number; depth: number; ci: number }

const hasHierarchy = computed(() => props.members.some((m) => m.parent_id != null))

// ─── Layout constants (fixed rows = every level is a clean, aligned band) ─────
const R = 39 // circle radius
const COL = 184 // horizontal slot per leaf
const ROW = 210 // vertical distance between levels
const PAD_TOP = 70 // room for the root crown stub
const NODE_W = 150

// Tidy tree: leaves get sequential columns, parents are centred over children.
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

  let cursor = 0
  const nodes: Node[] = []
  const walk = (n: Node, depth: number) => {
    n.depth = depth
    n.y = depth * ROW + PAD_TOP
    if (!n.children.length) {
      n.x = cursor * COL + COL / 2
      cursor++
    } else {
      n.children.forEach((c) => walk(c, depth + 1))
      n.x = (n.children[0].x + n.children[n.children.length - 1].x) / 2
    }
    nodes.push(n)
  }
  roots.forEach((r) => walk(r, 0))

  // Orthogonal connectors: one SVG path per parent (parent stub → bus → child
  // drops). Crowns: a short stub above each root, like the reference diagram.
  const paths: { d: string; depth: number; key: string }[] = []
  roots.forEach((r) =>
    paths.push({ d: `M ${r.x} ${r.y - R} L ${r.x} ${r.y - R - 22}`, depth: 0, key: `crown-${r.id}` }),
  )
  nodes.forEach((n) => {
    if (!n.children.length) return
    const midY = n.y + ROW / 2
    const xs = n.children.map((c) => c.x)
    let d = `M ${n.x} ${n.y + R} L ${n.x} ${midY} `
    d += `M ${Math.min(...xs)} ${midY} L ${Math.max(...xs)} ${midY} `
    n.children.forEach((c) => (d += `M ${c.x} ${midY} L ${c.x} ${c.y - R} `))
    paths.push({ d, depth: n.depth + 1, key: `e-${n.id}` })
  })

  const maxX = nodes.length ? Math.max(...nodes.map((n) => n.x)) : 0
  const maxDepth = nodes.length ? Math.max(...nodes.map((n) => n.depth)) : 0
  return {
    nodes,
    paths,
    width: maxX + COL / 2,
    height: maxDepth * ROW + PAD_TOP + R + 96, // + label room
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

  // Initial hidden states (set once so toggle reverse returns here).
  gsap.set(nodeEls, { autoAlpha: 0, scale: 0.8, transformOrigin: `50% ${R}px` })
  pathEls.forEach((p) => {
    const len = p.getTotalLength()
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
  })

  const maxDepth = Math.max(
    ...[...nodeEls].map((e) => Number(e.dataset.depth)),
  )

  tl = gsap.timeline({
    scrollTrigger: { trigger: root, start: 'top 80%', toggleActions: 'play none none reverse' },
    defaults: { ease: NOVA.ease },
  })

  for (let d = 0; d <= maxDepth; d++) {
    const dn = root.querySelectorAll(`.org-node[data-depth="${d}"]`)
    const dp = root.querySelectorAll(`.org-path[data-depth="${d}"]`)
    if (dp.length)
      tl.to(dp, { strokeDashoffset: 0, duration: 0.4, stagger: 0.08 }, d === 0 ? 0 : '>-0.12')
    if (dn.length)
      tl.to(
        dn,
        { autoAlpha: 1, scale: 1, duration: 0.42, stagger: 0.08 },
        dp.length ? '-=0.18' : 0,
      )
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

  <!-- hierarchy → diagram-style org chart with SVG connectors + GSAP draw-in -->
  <div v-else ref="chartRef" class="mt-12 overflow-x-auto pb-4">
    <div class="relative mx-auto" :style="{ width: layout.width + 'px', height: layout.height + 'px' }">
      <!-- connectors -->
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
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>

      <!-- nodes -->
      <div
        v-for="n in layout.nodes"
        :key="n.id"
        :data-depth="n.depth"
        class="org-node absolute"
        :style="{ left: n.x - NODE_W / 2 + 'px', top: n.y - R + 'px', width: NODE_W + 'px' }"
      >
        <RouterLink :to="`/equipe/${n.slug}`" class="group flex flex-col items-center no-underline">
          <div
            class="h-[78px] w-[78px] overflow-hidden rounded-full ring-2 ring-line transition-all duration-nova ease-nova group-hover:-translate-y-0.5 group-hover:ring-nova-lime group-hover:shadow-nova-md"
            :style="!n.photo ? { background: novaGrad(n.ci) } : {}"
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
